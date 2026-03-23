import { useEffect, useState } from "react";
import { getUsers, updateUser, blockUser } from "../api/users";

export default function UsersPage({ user }) {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    async function loadUsers() {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            setMessage("Ошибка при загрузке пользователей");
        }
    }

    useEffect(() => {
        if (user?.role === "admin") {
            loadUsers();
        }
    }, [user]);

    async function handleRoleChange(id, role) {
        try {
            await updateUser(id, { role });
            setMessage("Роль пользователя обновлена");
            loadUsers();
        } catch (error) {
            setMessage("Ошибка при изменении роли");
        }
    }

    async function handleBlock(id) {
        try {
            await blockUser(id);
            setMessage("Пользователь заблокирован");
            loadUsers();
        } catch (error) {
            setMessage("Ошибка при блокировке пользователя");
        }
    }

    if (!user) {
        return (
            <div className="container">
                <p>Пользователь не авторизован</p>
            </div>
        );
    }

    if (user.role !== "admin") {
        return (
            <div className="container">
                <p>Доступ запрещён</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Пользователи</h2>

            {message && <p className="message">{message}</p>}

            {users.length === 0 ? (
                <p>Пользователей пока нет</p>
            ) : (
                users.map((item) => (
                    <div className="product-card" key={item.id}>
                        <p><strong>Email:</strong> {item.email}</p>
                        <p><strong>Имя:</strong> {item.first_name}</p>
                        <p><strong>Фамилия:</strong> {item.last_name}</p>
                        <p><strong>Роль:</strong> {item.role}</p>
                        <p><strong>Заблокирован:</strong> {item.isBlocked ? "Да" : "Нет"}</p>

                        <div className="actions">
                            <button onClick={() => handleRoleChange(item.id, "user")}>
                                Сделать user
                            </button>

                            <button onClick={() => handleRoleChange(item.id, "seller")}>
                                Сделать seller
                            </button>

                            <button onClick={() => handleRoleChange(item.id, "admin")}>
                                Сделать admin
                            </button>

                            <button onClick={() => handleBlock(item.id)}>
                                Заблокировать
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}