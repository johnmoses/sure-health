var socket = io();
var modal = document.getElementById("modal-container");
var modalOpen = document.getElementById("modal-open");
var modalClose = document.getElementsByClassName("close")[0];

modalOpen.onclick = function() {
  modal.style.display = "block";
}

modalClose.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
let userHasScrolledUp = false;
const user_id = $('#user_id').val();
const user_name = $('#user_name').val();
const chat_id = $('#chat_id').val();

document.addEventListener('DOMContentLoaded', (e) => {
    const chatContainer = document.getElementById("chat");

    chatContainer.addEventListener('scroll', () => {
        const distanceFromBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
        userHasScrolledUp = distanceFromBottom > 5;
    });
});

function joinChat(chatid) {
    socket.emit(
        'join',
        {
            'user_id': user_id,
            'user_name': user_name,
            'chat_id': chatid,
            'content': user_name + ' joined chat...',
        },
    )
}

function leaveChat() {
    const chat_id = $('#chat_id').val();
    socket.emit(
        'leave',
        {
            'user_id': user_id,
            'user_name': user_name,
            'chat_id': chat_id,
            'content': user_name + ' left chat ...',
        },
    )
}

function sendMessage() {
    const content = $('#message').val();
    if (content.trim() !== "") { 
        socket.emit(
            'message',
            {
                'user_id': user_id,
                'user_name': user_name,
                'chat_id': chat_id,
                'content': content,
            },
        )
        document.getElementById("message").value = "";
    }
}

document.getElementById("message-form").addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});

document.getElementById("message").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('join-form').addEventListener('submit', (e) => {
    const form = new FormData(e.target);
    const chatid = form.get('join_chat_id')
    joinChat(chatid);
})

if (chat_id){
    document.getElementById('leave-chat').addEventListener('click', (e) => {
        leaveChat();
    })
};

socket.on('join', function(data){
    const msgWrapper = document.createElement('div');
    msgWrapper.innerHTML = `
        <div >
            <div>
                <span>${data['content']}</span>
            </div>
        </div>`;
    document.getElementById('chat').appendChild(msgWrapper);

    if (data.id) {
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    }
})

socket.on('leave', function(data){
    const msgWrapper = document.createElement('div');
    msgWrapper.innerHTML = `
        <div >
            <div>
                <span>${data['content']}</span>
            </div>
        </div>`;
    document.getElementById('chat').appendChild(msgWrapper);

    if (data.id) {
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    }
})

socket.on('message', function(data){
    const msgWrapper = document.createElement('div');
    msgWrapper.innerHTML = `
        <div >
            <div>
                <span>${data['content']}</span>
            </div>
        </div>`;
    document.getElementById('chat').appendChild(msgWrapper);

    if (data.id) {
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    }
})