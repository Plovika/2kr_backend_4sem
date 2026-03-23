import { useState } from "react";
import { createProduct } from "../api/products";

export default function ProductCreatePage({user}) {
    if (!user) {
        return (
            <div className="container">
                <p>Пользователь не авторизован</p>
            </div>
        );
    }

    if (user.role !== "seller" && user.role !== "admin") {
        return (
            <div className="container">
                <p>Доступ запрещён</p>
            </div>
        );
    }
    const [form, setForm] = useState({
        title: "",
        category: "",
        description: "",
        price: "",
    });

    const [message, setMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const productData = {
                ...form,
                price: Number(form.price),
            };

            await createProduct(productData);
            setMessage("Товар успешно создан");

            setForm({
                title: "",
                category: "",
                description: "",
                price: "",
            });
        } catch (error) {
            setMessage("Ошибка при создании товара");
        }
    }

    return (
        <div className="container">
            <h2>Создание товара</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="title"
                        placeholder="Название"
                        value={form.title}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="category"
                        placeholder="Категория"
                        value={form.category}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="description"
                        placeholder="Описание"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="number"
                        name="price"
                        placeholder="Цена"
                        value={form.price}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit">Создать товар</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}