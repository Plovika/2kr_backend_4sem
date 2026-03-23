import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import { getMe } from "./api/auth";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductEditPage from "./pages/ProductEditPage";
function HomePage() {
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
        <div className="container" >
            <div className="actions" >
                <p>
                    <Link to="/register">Регистрация</Link>
                </p>

                <p>
                    <Link to="/login">Вход</Link>
                </p >

                <p>
                    <Link to="/products">Товары</Link>
                </p>

                <p >
                    <Link to="/products/create">Создать товар</Link>
                </p>
            </div>


            {user ? (
                <div className="container">
                    <h3>Текущий пользователь:</h3>
                    <p>Email: {user.email}</p>
                    <p>Имя: {user.first_name}</p>
                    <p>Фамилия: {user.last_name}</p>
                </div>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<ProductCreatePage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
        </Routes>
    );
}