document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/';
    }
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await axios.post("/user/login", data, {
                header: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                Toastify({
                    text: response.data.message,
                    style: {
                        background: "green",
                    },
                    close: true,
                    gravity: "top",
                    position: "right",
                    duration: 2000,
                }).showToast();
                localStorage.setItem('token', response.data.user.token);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('username', response.data.user.name);
                form.reset();
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            if (error.response && error.response.status === 401 || error.response.status === 404 || error.response.status === 400) {
                Toastify({
                    text: error.response.data.error,
                    style: {
                        background: "red",
                    },
                    close: true,
                    gravity: "top",
                    position: "right",
                    duration: 3000,
                }).showToast();
            } else {
                console.log("Login error:", error);
                Toastify({
                    text: error.response.data.error,
                    style: {
                        background: "red",
                    },
                    close: true,
                    gravity: "top",
                    position: "right",
                    duration: 3000,
                }).showToast();
            }
        }
    })
})