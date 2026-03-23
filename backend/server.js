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

// функции чтобы генерировались токены
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
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
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}
//функция до выполнения маршрутов(есть ли токен, правильный не истек?)

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


app.get("/", (req, res) => {
    res.send("Сервер работает");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

//регистрация

app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

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
    };

    users.push(newUser);

    res.status(201).json({
        message: "Пользователь зарегистрирован",
        user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
        },
    });
});


//  логин(емейл) (уже с токеном, практик 8)
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = users.find((user) => user.email === email);

    if (!user) {
        return res.status(401).json({ message: "Неверные учетные данные" });
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
//маршрут рефреш
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


//auth me
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
    });
});
//создание товара
app.post("/api/products", (req, res) => {
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
});
//получить все товары
app.get("/api/products", (req, res) => {
    res.status(200).json(products);
});
//получение товара по айди
app.get("/api/products/:id",authMiddleware, (req, res) => {
    const product = products.find((item) => item.id === req.params.id);

    if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
    }

    res.status(200).json(product);
});

//обновление товара
app.put("/api/products/:id",authMiddleware, (req, res) => {
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
});
//удаление товара
app.delete("/api/products/:id",authMiddleware, (req, res) => {
    const productIndex = products.findIndex((item) => item.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ message: "Товар не найден" });
    }

    products.splice(productIndex, 1);

    res.status(200).json({ message: "Товар удалён" });
});
app.get("/api/users", (req, res) => {
    res.json(users);
});