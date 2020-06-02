const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, cate) => {
    if (err || !cate) {
      return res.status(400).json({
        error: "Category not found in database",
      });
    }
    req.category = cate;
    next();
  });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((err, cat) => {
    if (err) {
      return res.status(400).json({ error: "Not able to create category" });
    }
    res.json({ cat }); //<== remove extra braces
  });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return res.status(400).json({ error: "No categories found" });
    }
    res.json(categories);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
 console.log("USER AGENT",req.get('User-Agent'));
 
  category.save((err, updatedCategory) => {
    if (err) {
      return res.status(400).json({ error: "Failed to update category, Error: "+err });
    }
    res.json(updatedCategory);
  });
};

exports.removeCategory = (req, res) => {
  const category = req.category;
  category.remove((err, cat) => {
    if (err) {
      return res.status(400).json({ error: "Failed to delete this category" });
    }
    res.json({ message: cat.name + " was deleted successfully" });
  });
};
