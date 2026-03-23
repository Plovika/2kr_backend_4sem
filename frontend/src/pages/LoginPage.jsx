import { useState } from "react";
import { loginUser } from "../api/auth";

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
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
            const data = await loginUser(form);

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            setMessage("Вход выполнен успешно");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Ошибка при входе"
            );
        }
    }

    return (
        <div className="container">
            <h2>Вход</h2>

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
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit">Войти</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}