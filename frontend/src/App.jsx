import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductEditPage from "./pages/ProductEditPage";
import UsersPage from "./pages/UsersPage";
import { getMe } from "./api/auth";

function HomePage({ user, message }) {
    return (
        <div className="container">


            <p>
                <Link to="/register">Регистрация</Link>
            </p>

            <p>
                <Link to="/login">Вход</Link>
            </p>

            {user && (
                <>
                    <p>
                        <Link to="/products">Товары</Link>
                    </p>

                    {(user.role === "seller" || user.role === "admin") && (
                        <p>
                            <Link to="/products/create">Создать товар</Link>
                        </p>
                    )}

                    {user.role === "admin" && (
                        <p>
                            <Link to="/users">Пользователи</Link>
                        </p>
                    )}
                </>
            )}

            {user ? (
                <div>
                    <h3>Текущий пользователь:</h3>
                    <p>Email: {user.email}</p>
                    <p>Имя: {user.first_name}</p>
                    <p>Фамилия: {user.last_name}</p>
                    <p>Роль: {user.role}</p>
                </div>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("Загрузка...");

    useEffect(() => {
        async function loadUser() {
            try {
                const data = await getMe();
                setUser(data);
                setMessage("");
            } catch (error) {
                setUser(null);
                setMessage("Пользователь не авторизован");
            }
        }

        loadUser();
    }, []);

    return (
        <Routes>
            <Route path="/" element={<HomePage user={user} message={message} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage user={user} />} />
            <Route path="/products/create" element={<ProductCreatePage user={user} />} />
            <Route path="/products/:id" element={<ProductDetailsPage user={user} />} />
            <Route path="/products/:id/edit" element={<ProductEditPage user={user} />} />
            <Route path="/users" element={<UsersPage user={user} />} />
        </Routes>
    );
}