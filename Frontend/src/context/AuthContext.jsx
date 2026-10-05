import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const normalizeUser = (userData = null, loginToken = null) => {
        const baseUser = userData && typeof userData === "object" ? { ...userData } : {};
        let tokenClaims = {};

        if (loginToken) {
            try {
                const base64Payload = loginToken.split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");
                tokenClaims = JSON.parse(atob(base64Payload));
            } catch {
                tokenClaims = {};
            }
        }

        const firstName = baseUser.firstName || baseUser.first_name || tokenClaims.firstName || tokenClaims.given_name || null;
        const lastName = baseUser.lastName || baseUser.last_name || tokenClaims.lastName || tokenClaims.family_name || null;
        const email = baseUser.email || tokenClaims.email || null;
        const role = baseUser.role || tokenClaims.role || null;
        const name = baseUser.name ||
            [firstName, lastName].filter(Boolean).join(" ") ||
            tokenClaims.name ||
            tokenClaims.unique_name ||
            tokenClaims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
            null;

        const normalized = {
            ...baseUser,
            ...(firstName ? { firstName } : {}),
            ...(lastName ? { lastName } : {}),
            ...(email ? { email } : {}),
            ...(role ? { role } : {}),
            ...(name ? { name } : {}),
        };

        return Object.keys(normalized).length > 0 ? normalized : null;
    };

    const login = (loginToken, userData = null) => {
        setToken(loginToken);

        const normalizedUser = normalizeUser(userData, loginToken);
        setUser(normalizedUser);

        if (normalizedUser) {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
        } else {
            localStorage.removeItem("user");
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}