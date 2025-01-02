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
            const response = await axios.post("/user/signup", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 201) {
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
                form.reset();
                setTimeout(() => {
                    window.location.href = '/user/login';
                }, 1000);
            } else {
                Toastify({
                    text: "Signup failed. Please try again.",
                    style: {
                        background: "red",
                    },
                    close: true,
                    gravity: "top",
                    position: "right",
                    duration: 3000,
                }).showToast();
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
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
            } else if (error.response && error.response.status === 400) {
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
    });
});