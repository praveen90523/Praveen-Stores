import { useState } from "react";
import { createProduct } from "../services/productService";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    await createProduct(
      form,
      token
    );

    alert("Product Added");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6"
    >
      <input
        placeholder="Name"
        className="border p-3 w-full mb-3"
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Price"
        className="border p-3 w-full mb-3"
        onChange={(e) =>
          setForm({
            ...form,
            price: e.target.value,
          })
        }
      />

      <button className="bg-green-600 text-white px-6 py-3 rounded">
        Add Product
      </button>
    </form>
  );
};

export default AddProduct;