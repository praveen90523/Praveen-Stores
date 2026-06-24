import { useEffect, useState } from "react";
import API from "../api/productApi";

const ProductList = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await API.get("/products");
            setProducts(res.data.products);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="container">
            <h1>Products</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "20px",
                }}
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "15px",
                            borderRadius: "10px",
                        }}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            width="150"
                        />

                        <h3>{product.name}</h3>

                        <p>{product.description}</p>

                        <h4>₹{product.price}</h4>

                        <button>Add To Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;