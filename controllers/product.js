const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found in database",
        });
      }
      req.product = product;
      next();
    });
};

exports.getSearchQuery = (req, res, next, query) => {
  req.query.searchQuery = query;
  next();
}
exports.getSortBy = (req, res, next, sortBy) => {
  req.query.sortBy = sortBy;
  next();
}
exports.getSortOrder = (req, res, next, sortOrder) => {
  req.query.sortOrder = sortOrder;
  next();
}

exports.createProduct = (req, res) => {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Something is not right with the image you uploaded.",
      });
    }

    //Destructure the fields
    const { price, name, description, category, stock } = fields;

    if (!price || !name || !description || !category || !stock) {
      return res.status(400).json({ error: "Please include all fields" });
    }

    //create product
    let product = new Product(fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save to db
    product.save((err, product) => {
      if (err) {
        res.status(400).json({ error: "Failed to save product to databse" });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

//delete controller
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "Failed to delete " + product.name });
    }
    res.json({
      message: product.name + " was deleted successfully",
      deletedProduct,
    });
  });
};

//update controller
exports.updateProduct = (req, res) => {
  console.log("BODY:::", req.body);
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Something is not right with the image you uploaded.",
      });
    }

    //get product
    let product = req.product;
    //update
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save to db
    product.save((err, product) => {
      if (err) {
        res.status(400).json({ error: "Failed to update " + product.name });
      }
      res.json(product);
    });
  });
};

exports.getAllProducts = (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) < 50 ? parseInt(req.query.limit) : 5;
  let searchQuery = (req.query.searchquery && req.query.searchquery !== "*") ?
    { $text: { $search: req.query.searchquery } } : undefined;
  let sortOrder = req.query.sortorder === 'asc' ? 'asc' : 'desc';
  let sortBy = req.query.sortby || 'createdAt';
  let skip = page <= 1 ? 0 : (page - 1) * limit;

  Product.find(searchQuery)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, sortOrder]])
    .skip(skip)
    .limit(limit)
    .exec((err, products) => {
      if (err || !products || (products && products.length == 0)) {
        return res.status(400).json({ error: "No products found" });
      }
      Product.countDocuments(searchQuery).exec((count_error, count) => {
        if (count_error) {
          console.log("COUNT DOCUMENT ERROR", count_error);
          return res.status(400).json({ error: "An error occured while counting the results" });
        }
        let totalPages = Math.ceil(count / limit);
        if (page > totalPages || page <= 0) {
          return res.status(400).json({ error: "Invalid page number requested!" });
        }
        return res.json({
          totalPages: totalPages,
          totalMatchfound: count,
          page: page,
          limit: limit,
          products: products
        });
      });
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({ error: "No category found" });
    }
    res.json(categories);
  });
};

//middleware
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({ error: "Failed to update stock" });
    }
    next();
  });
};
