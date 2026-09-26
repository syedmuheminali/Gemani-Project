import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <main style={{display:"flex",justifyContent:"center",alignItems:'center',height:'100vh'}}>
                <h1>Checking authentication...</h1>
            </main>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;