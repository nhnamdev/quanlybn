import { useState } from "react";

const VALID_USERNAME = "tienquanlybn";
const VALID_PASSWORD = "Tien123@";

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        await new Promise((r) => setTimeout(r, 600));

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            sessionStorage.setItem("auth", "1");
            onLogin();
        } else {
            setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f4c81 100%)",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            padding: "16px"
        }}>
            {/* Background decorations */}
            <div style={{
                position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none"
            }}>
                <div style={{
                    position: "absolute", top: "-10%", left: "-5%",
                    width: "400px", height: "400px", borderRadius: "50%",
                    background: "rgba(59,130,246,0.12)", filter: "blur(60px)"
                }} />
                <div style={{
                    position: "absolute", bottom: "-10%", right: "-5%",
                    width: "500px", height: "500px", borderRadius: "50%",
                    background: "rgba(16,185,129,0.10)", filter: "blur(80px)"
                }} />
            </div>

            <div style={{
                width: "100%", maxWidth: "420px", position: "relative", zIndex: 1
            }}>
                {/* Logo / Title */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "72px", height: "72px", borderRadius: "20px",
                        background: "linear-gradient(135deg, #3b82f6, #10b981)",
                        boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
                        marginBottom: "16px"
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.3"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
                        </svg>
                    </div>
                    <h1 style={{
                        color: "#f8fafc", fontSize: "26px", fontWeight: 700,
                        margin: "0 0 4px 0", letterSpacing: "-0.5px"
                    }}>
                        Phòng khám
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                        Hệ thống quản lý bệnh nhân
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "24px",
                    padding: "36px 32px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
                }}>
                    <h2 style={{
                        color: "#f1f5f9", fontSize: "20px", fontWeight: 600,
                        margin: "0 0 6px 0"
                    }}>
                        Đăng nhập
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 28px 0" }}>
                        Vui lòng đăng nhập để tiếp tục
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: "18px" }}>
                            <label style={{
                                display: "block", color: "#cbd5e1", fontSize: "13px",
                                fontWeight: 500, marginBottom: "8px"
                            }}>
                                Tên đăng nhập
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: "14px", top: "50%",
                                    transform: "translateY(-50%)", color: "#64748b"
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z"/>
                                    </svg>
                                </span>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    autoComplete="username"
                                    required
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        background: "rgba(255,255,255,0.07)",
                                        border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: "12px", color: "#f1f5f9",
                                        fontSize: "14px", outline: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                                    onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.12)"}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{
                                display: "block", color: "#cbd5e1", fontSize: "13px",
                                fontWeight: 500, marginBottom: "8px"
                            }}>
                                Mật khẩu
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: "14px", top: "50%",
                                    transform: "translateY(-50%)", color: "#64748b"
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z"/>
                                    </svg>
                                </span>
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    autoComplete="current-password"
                                    required
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: "12px 42px 12px 42px",
                                        background: "rgba(255,255,255,0.07)",
                                        border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: "12px", color: "#f1f5f9",
                                        fontSize: "14px", outline: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                                    onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.12)"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    style={{
                                        position: "absolute", right: "14px", top: "50%",
                                        transform: "translateY(-50%)", background: "none",
                                        border: "none", cursor: "pointer", color: "#64748b",
                                        padding: 0, display: "flex", alignItems: "center"
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 7c2.8 0 5 2.2 5 5 0 .6-.1 1.3-.4 1.8l2.9 2.9c1.5-1.3 2.7-2.9 3.4-4.7-1.6-4-5.5-7-10-7-1.3 0-2.5.2-3.6.6l2.1 2.1C11 7.1 11.5 7 12 7zm-9.7-1.5L4.3 7.5l.9.9C3.5 9.7 2.3 11.3 1.5 13c1.6 4 5.5 7 10 7 1.4 0 2.8-.3 4-.8l.9.9 1.9 1.9 1.4-1.4L3.7 4.1 2.3 5.5zm5.4 5.4l1.4 1.4c0 .2-.1.4-.1.7 0 1.7 1.3 3 3 3 .2 0 .5 0 .7-.1l1.4 1.4c-.6.3-1.3.5-2.1.5-2.8 0-5-2.2-5-5 0-.8.2-1.5.7-2.1v.2z"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "10px", padding: "10px 14px",
                                color: "#fca5a5", fontSize: "13px", marginBottom: "16px",
                                display: "flex", alignItems: "center", gap: "8px"
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "13px",
                                background: loading
                                    ? "rgba(59,130,246,0.5)"
                                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                                border: "none", borderRadius: "12px",
                                color: "#fff", fontSize: "15px", fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                                transition: "all 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
                                        borderTopColor: "#fff", borderRadius: "50%",
                                        display: "inline-block", animation: "spin 0.7s linear infinite"
                                    }} />
                                    Đang đăng nhập...
                                </>
                            ) : "Đăng nhập"}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: "center", color: "#334155", fontSize: "12px", marginTop: "24px" }}>
                    © {new Date().getFullYear()} Phòng khám. Bảo lưu mọi quyền.
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: #475569; }
            `}</style>
        </div>
    );
}

export default LoginPage;
