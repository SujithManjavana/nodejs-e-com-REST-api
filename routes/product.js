const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  getProductById,
  getSearchQuery,
  getSortBy,
  getSortOrder,
  getProduct,
  photo,
  deleteProduct,
  updateProduct,
  getAllUniqueCategories,
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//Params
router.param("productId", getProductById);
router.param("userId", getUserById);
router.param("searchQuery", getSearchQuery);
router.param("sortBy", getSortBy);
router.param("sortOrder", getSortOrder);

//Routes
//CREATE
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//READ
router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);

//UPDATE
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

//DELETE
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

//listing
router.get("/products/:searchQuery/:sortBy/:sortOrder", getAllProducts);

router.get("/products/categories", getAllUniqueCategories);

module.exports = router;
