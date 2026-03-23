import { useState } from "react";
import { registerUser } from "../api/auth";

export default function RegisterPage() {
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
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
            const data = await registerUser(form);
            setMessage(data.message || "Регистрация успешна");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Ошибка при регистрации"
            );
        }
    }

    return (
        <div className="container">
            <h2>Регистрация</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Имя"
                        value={form.first_name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Фамилия"
                        value={form.last_name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit">Зарегистрироваться</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}