import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "./ProtectLoader.scss";

const Protected = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <main className="protected-loader">
                <div className="loader"></div>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Protected;