import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/products";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            setMessage("Ошибка при загрузке товаров");
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function handleDelete(id) {
        try {
            await deleteProduct(id);
            setMessage("Товар удалён");
            loadProducts();
        } catch (error) {
            setMessage("Ошибка при удалении товара");
        }
    }

    return (
        <div className="container">
            <h2>Список товаров</h2>

            {message && <p>{message}</p>}

            {products.length === 0 ? (
                <p>Товаров пока нет</p>
            ) : (
                <div className="product-card" >
                    <ul >
                        {products.map((product) => (
                            <li key={product.id}>
                                <p><strong>Название:</strong> {product.title}</p>
                                <p><strong>Категория:</strong> {product.category}</p>
                                <p><strong>Описание:</strong> {product.description}</p>
                                <p><strong>Цена:</strong> {product.price}</p>
                                <div className="actions">
                                    <p>
                                        <Link to={`/products/${product.id}`}>Открыть товар</Link>
                                    </p>

                                    <p >
                                        <Link to={`/products/${product.id}/edit`}>Редактировать</Link>
                                    </p>

                                    <button onClick={() => handleDelete(product.id)}>
                                        Удалить
                                    </button>

                                </div>



                                <hr />
                            </li>
                        ))}
                    </ul>
                </div>

            )}
        </div>
    );
}