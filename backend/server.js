const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const products = [];
const refreshTokens = new Set();

const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// генерация токенов
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }

        next();
    };
}

app.get("/", (req, res) => {
    res.send("Сервер работает");
});

//регистрация
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ message: "Все поля обязательны" });
    }

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
        return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now().toString(),
        email,
        first_name,
        last_name,
        password: passwordHash,
        role: role || "user",
        isBlocked: false,
    };

    users.push(newUser);

    res.status(201).json({
        message: "Пользователь зарегистрирован",
        user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
            isBlocked: newUser.isBlocked,
        },
    });
});

// логин
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = users.find((user) => user.email === email);

    if (!user) {
        return res.status(401).json({ message: "Неверные учетные данные" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ message: "Пользователь заблокирован" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Неверные учетные данные" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.status(200).json({
        accessToken,
        refreshToken,
    });
});

// рефреш токен
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find((user) => user.id === payload.sub);

        if (!user) {
            return res.status(401).json({
                error: "User not found",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                error: "User is blocked",
            });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

// тек пользователь

app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;

    const user = users.find((user) => user.id === userId);

    if (!user) {
        return res.status(404).json({
            error: "Пользователь не найден",
        });
    }

    res.status(200).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isBlocked: user.isBlocked,
    });
});

// товары

// создание товара сэллер админ
app.post(
    "/api/products",
    authMiddleware,
    roleMiddleware(["seller", "admin"]),
    (req, res) => {
        const { title, category, description, price } = req.body;

        if (!title || !category || !description || price === undefined) {
            return res.status(400).json({ message: "Все поля товара обязательны" });
        }

        const newProduct = {
            id: Date.now().toString(),
            title,
            category,
            description,
            price,
        };

        products.push(newProduct);

        res.status(201).json(newProduct);
    }
);

// получить все товары юзер селлер админ
app.get(
    "/api/products",
    authMiddleware,
    roleMiddleware(["user", "seller", "admin"]),
    (req, res) => {
        res.status(200).json(products);
    }
);

// товар по айди юзер селлэр и админ
app.get(
    "/api/products/:id",
    authMiddleware,
    roleMiddleware(["user", "seller", "admin"]),
    (req, res) => {
        const product = products.find((item) => item.id === req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        res.status(200).json(product);
    }
);

// обновить товар  селлэр и админ
app.put(
    "/api/products/:id",
    authMiddleware,
    roleMiddleware(["seller", "admin"]),
    (req, res) => {
        const product = products.find((item) => item.id === req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        const { title, category, description, price } = req.body;

        if (title !== undefined) product.title = title;
        if (category !== undefined) product.category = category;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;

        res.status(200).json(product);
    }
);

// удалить товар админ
app.delete(
    "/api/products/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {
        const productIndex = products.findIndex((item) => item.id === req.params.id);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        products.splice(productIndex, 1);

        res.status(200).json({ message: "Товар удалён" });
    }
);

// юзеры админ


// список пользователей
app.get(
    "/api/users",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {
        const safeUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            isBlocked: user.isBlocked,
        }));

        res.status(200).json(safeUsers);
    }
);

// юзер по id
app.get(
    "/api/users/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {
        const user = users.find((user) => user.id === req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            isBlocked: user.isBlocked,
        });
    }
);

// обновить пользователя
app.put(
    "/api/users/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {
        const user = users.find((user) => user.id === req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const { email, first_name, last_name, role } = req.body;

        if (email !== undefined) user.email = email;
        if (first_name !== undefined) user.first_name = first_name;
        if (last_name !== undefined) user.last_name = last_name;
        if (role !== undefined) user.role = role;

        res.status(200).json({
            message: "Пользователь обновлён",
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                isBlocked: user.isBlocked,
            },
        });
    }
);

// заблокировать
app.delete(
    "/api/users/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {
        const user = users.find((user) => user.id === req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        user.isBlocked = true;

        res.status(200).json({
            message: "Пользователь заблокирован",
        });
    }
);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});