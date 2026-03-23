import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../api/products";

export default function ProductEditPage({user}) {
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
    const { id } = useParams();

    const [form, setForm] = useState({
        title: "",
        category: "",
        description: "",
        price: "",
    });

    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await getProductById(id);

                setForm({
                    title: data.title || "",
                    category: data.category || "",
                    description: data.description || "",
                    price: data.price || "",
                });
            } catch (error) {
                setMessage("Ошибка при загрузке товара");
            }
        }

        loadProduct();
    }, [id]);

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
            const updatedData = {
                ...form,
                price: Number(form.price),
            };

            await updateProduct(id, updatedData);
            setMessage("Товар успешно обновлён");
        } catch (error) {
            setMessage("Ошибка при обновлении товара");
        }
    }

    return (
        <div className="container">
            <h2>Редактирование товара</h2>

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

                <button type="submit">Сохранить изменения</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}