import React from 'react';
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from "yup";

const validationSchema = Yup.object({
    email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
})

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await handleLogin({ email: values.email, password: values.password })
                navigate('/')
            } catch (error) {
                console.error('Login error:', error)
            } finally {
                setSubmitting(false)
            }
        }
    })

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container">
                    <p className="auth-loading">Checking session...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={formik.handleSubmit}>
                    {/* Email */}
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter Your Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="error">{formik.errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter Your Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="error">{formik.errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
}

export default Login