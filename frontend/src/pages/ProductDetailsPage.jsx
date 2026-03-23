import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/products";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (error) {
                setMessage("Ошибка при загрузке товара");
            }
        }

        loadProduct();
    }, [id]);

    if (message) {
        return <p>{message}</p>;
    }

    if (!product) {
        return <p>Загрузка...</p>;
    }

    return (
        <div className="container">
            <h2>Информация о товаре</h2>

            <p><strong>ID:</strong> {product.id}</p>
            <p><strong>Название:</strong> {product.title}</p>
            <p><strong>Категория:</strong> {product.category}</p>
            <p><strong>Описание:</strong> {product.description}</p>
            <p><strong>Цена:</strong> {product.price}</p>

            <p>
                <Link to={`/products/${product.id}/edit`}>Редактировать товар</Link>
            </p>
        </div>
    );
}