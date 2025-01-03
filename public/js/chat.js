//const socket = io("http://localhost:4000");

const modalSubmitBtn = document.getElementById('modalSubmitButton');
const chatForm = document.getElementById("chatForm");
const formHiddenInput = chatForm.querySelector('input[type="hidden"]');
const chatsDiv = document.getElementById("chats");
const groupModal = document.getElementById("groupModal");
const createGroupBtn = document.getElementById("createGroupButton");
const modalCloseBtn = document.getElementById("modalCloseButton");
const createGroupFrom = document.getElementById('createGroupForm');
const userListContainer = document.getElementById("userListContainer");
const user_list = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutButton");
const groupHeading = document.getElementById("groupHead");
const groupChatDesc = document.getElementById("groupDesc");
const editGroupBtn = document.getElementById("editGroup");
const searchBar = document.getElementById("searchBar");
const usersSelect = document.getElementById("usersSelect");
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

const LOCAL_STORAGE_KEY = "groupChatMessages";
const MAX_LOCAL_STORAGE_CHATS = 10;
let group_id = 1, group_name = "Common Group", group_desc = 'This is the common group.', group_users = [], admin_id = null, isEdit = false;
let userSelectSet = new Set();
let timerId = null;

const loadChatsFromLocalStorage = () => {
    const storedChats = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    chatsDiv.innerHTML = "";
    storedChats.forEach(chat => {
        const chatBox = document.createElement("div");
        chatBox.className = "p-4 bg-emerald-200 rounded-lg shadow-md border border-emerald-600 break-words";
        chatBox.innerHTML = `
                <span class="text-emerald-800 font-semibold">${chat.user}:</span>
                <span class="ml-2">${chat.message}</span>
            `;
        chatsDiv.appendChild(chatBox);
    });
};

const saveChatsToLocalStorage = (chats) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
};

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    const formElement = event.target;

    const hiddenInput = formElement.querySelector('input[type="hidden"]');
    const currentGroupId = hiddenInput.id;
    if (message) {
        try {
            const response = await axios.post("/chats/chat",
                { message, userId, username, currentGroupId },
                { headers: { 'Authorization': token } }
            );
            const newChat = {
                user: response.data.name,
                message: response.data.message,
                timestamp: response.data.createdAt,
            };
            const storedChats = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

            const updatedChats = [newChat, ...storedChats].slice(0, MAX_LOCAL_STORAGE_CHATS);

            saveChatsToLocalStorage(updatedChats);
            messageInput.value = "";
            loadChatsFromLocalStorage();
            //socket.emit("messageSent", "message sent successfully");
        } catch (error) {
            console.error("Error sending chat:", error);
        }
    }
});

createGroupBtn.addEventListener("click", () => {
    groupModal.classList.remove("hidden");
    modalSubmitBtn.textContent = "Create Group";

});

editGroupBtn.addEventListener("click", async () => {
    modalSubmitBtn.textContent = "Update Group";
    isEdit = true;

    groupModal.classList.remove("hidden");
    createGroupFrom.querySelector('#group_name').value = group_name;
    createGroupFrom.querySelector('#groupDescription').value = group_desc;

    const response = await axios.get(`/chats/get-users-group?groupId=${group_id}`,
        { headers: { 'Authorization': token } }
    );

    userListContainer.classList.remove("hidden");
    user_list.innerHTML = "";
    let text = "";
    const filteredUsers = response.data.users.filter(item => item.id != userId);

    filteredUsers.forEach((user) => {
        userSelectSet.add(user.id)
        text += `
            <li class="flex justify-between items-center p-3 bg-emerald-200 border-b border-emerald-700 rounded-lg">
                <div class="flex items-center space-x-3">
                    <h6 class="font-semibold text-gray-700">${user.name}</h6>
                </div>
                <input
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-emerald-950"
                    name="users"
                    value="${user.id}"
                    ${userSelectSet.has(user.id) ? 'checked' : ''}
                >
            </li>`;
    });

    user_list.innerHTML = text;
    setSelectUsers()
})

searchBar.addEventListener("keyup", async (e) => {
    try {
        userListContainer.classList.remove("hidden");
        const text = e.target.value.toLowerCase();
        const usersResponse = await axios.get("/chats/get-users", {
            headers: { 'Authorization': token }
        });
        const { users } = usersResponse.data;

        user_list.innerHTML = "";

        function searchArray(query, data) {
            const searchText = query.toLowerCase();

            return data.filter(item => {
                const nameMatch = item.name.toLowerCase().includes(searchText);
                const emailMatch = item.email.toLowerCase().includes(searchText);
                const mobileMatch = item.mobile.toLowerCase().includes(searchText);

                return nameMatch || emailMatch || mobileMatch;
            });
        }
        const results = searchArray(text, users);
        let htmlTexts = "";
        results.forEach((user) => {
            htmlTexts += `                                  
                <li class="flex justify-between items-center p-3 bg-emerald-200 border-b border-emerald-700 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <h6 class="font-semibold text-gray-700">${user.name}</h6>
                    </div>
                    <input 
                        type="checkbox" 
                        id="usersSelect"
                        class="form-checkbox h-5 w-5 text-emerald-950" 
                        name="users" 
                        value="${user.id}"
                        ${userSelectSet.has(user.id) ? 'checked' : ''}
                    >
                </li>`;
        });
        user_list.innerHTML = htmlTexts;
        setSelectUsers();
    }
    catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to fetch users");
    }
});

function setSelectUsers() {
    const checkboxes = user_list.querySelectorAll('input[name="users"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const uId = Number(event.target.value);
            if (!userSelectSet.has(uId) && event.target.checked) {
                userSelectSet.add(uId);
            } else if (userSelectSet.has(uId) && !event.target.checked) {
                userSelectSet.delete(uId);
            }
        });
    });
}

modalCloseBtn.addEventListener("click", () => {
    isEdit = false;
    groupModal.classList.add("hidden");
});

modalSubmitBtn.addEventListener("click", async (e) => {
    try {
        if (createGroupFrom.checkValidity()) {
            e.preventDefault();
            const groupName = createGroupFrom.querySelector('#group_name').value;
            const groupDescription = createGroupFrom.querySelector('#groupDescription').value;

            const selectedUsers = Array.from(userSelectSet);

            const data = {
                name: groupName,
                membersNo: selectedUsers.length + 1,
                membersIds: selectedUsers,
                description: groupDescription,
                adminId: admin_id
            }

            if (isEdit) {
                const response = await axios.post(`/chats/update-group?groupId=${group_id}`, data,
                    { headers: { "Authorization": token } }
                );
                showGroupChats(response.data.group.id, response.data.group.name, response.data.group.description, response.data.group.AdminId);
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

            } else {
                await axios.post('/chats/create-group', data,
                    { headers: { "Authorization": token } }
                );
                Toastify({
                    text: "Group successfully created",
                    style: {
                        background: "green",
                    },
                    close: true,
                    gravity: "top",
                    position: "right",
                    duration: 2000,
                }).showToast();
            }
            createGroupFrom.reset();
            userSelectSet.clear();
            user_list.innerHTML = "";
            groupModal.classList.add("hidden");
            //socket.emit("group", "Group created/updated");
            showGroup();
        } else {
            Toastify({
                text: 'Fill all details',
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
        console.log(error);
        Toastify({
            text: error.response.error.message,
            style: {
                background: "red",
            },
            close: true,
            gravity: "top",
            position: "right",
            duration: 3000,
        }).showToast();
    }
});

async function showGroup() {
    try {
        const groupList = document.getElementById("groupList");

        const response = await axios.get("/chats/get-mygroups", {
            headers: { "Authorization": token }
        });
        const { groups } = response.data;

        groupList.innerHTML = "";
        groupList.innerHTML =
            `<div
            class="p-3 border border-emerald-500 rounded-lg cursor-pointer hover:bg-emerald-100 flex items-center justify-between"
            id="0"
        >
            <div class="flex items-center space-x-3" onclick="showGroupChats(1, 'Common Group','This is the common group.', null)">
            <strong class="text-gray-700">Common-group</strong>
            </div>
            <small class="text-gray-500">All Members</small>
        </div>`;
        groups.forEach((group) => {
            groupList.innerHTML += `
            <div
            class="p-3 border border-emerald-500 rounded-lg cursor-pointer hover:bg-emerald-100 flex items-center justify-between"
            id="${group.id}" onclick="showGroupChats('${group.id}', '${group.name}', '${group.description}','${group.AdminId}')"
            >
                <div class="flex items-center space-x-3">
                    <strong class="text-gray-700">${group.name}</strong>
                </div>
                <small class="text-gray-500">${group.membersNo} Members</small>
            </div>`;
        });
    } catch (error) {
        console.error(error);
    }
}

async function showGroupChats(groupId, groupName, groupDesc, admin) {
    group_id = groupId;
    group_name = groupName;
    group_desc = groupDesc;
    admin_id = admin;
    let isAdmin = admin_id === userId;
    try {
        const APIresponse = await axios.get(`chats/get-group-messages?groupId=${groupId}`, {
            headers: { "Authorization": token }
        });
        const apiChats = APIresponse.data.chats;
        if (isAdmin) {
            editGroupBtn.removeAttribute('hidden');
        } else {
            editGroupBtn.setAttribute('hidden', '');
        }

        formHiddenInput.setAttribute("id", groupId);
        groupHeading.textContent = group_name;
        groupChatDesc.textContent = group_desc;
        const updatedChats = apiChats.slice(0, MAX_LOCAL_STORAGE_CHATS);

        saveChatsToLocalStorage(updatedChats);
        loadChatsFromLocalStorage();
    } catch (error) {
        console.log(error);
        alert(error.response.data.message);
    }
}

logoutBtn.addEventListener("click", () => {
    clearInterval(timerId);
    localStorage.removeItem("groupChatMessages");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "/user/login";
});

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "/user/login";
    }
    showGroupChats(group_id, group_name, group_desc, admin_id);
    showGroup();

    timerId = setInterval(() => {
        showGroupChats(group_id, group_name, group_desc, admin_id);
        showGroup();
    }, 1000);

    // socket.on('message received', (msg) => {
    //     console.log('Server says:', msg);
    //     showGroupChats(group_id, group_name, group_desc, admin_id);
    // });

    // socket.on('group created or updated', (msg) => {
    //     console.log('Server says:', msg);
    //     showGroup();
    //     showGroupChats(group_id, group_name, group_desc, admin_id);
    // });
});