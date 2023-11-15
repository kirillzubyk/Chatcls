// public/script.js
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const participantsList = document.getElementById('participants-list');
    const nameInput = document.getElementById('name-input');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    const socket = io(); // Подключение к серверу по сокету

    // Загрузка сохраненного имени из localStorage при загрузке страницы
    loadName();

    // Добавляем текущего участника при подключении
    addParticipant();

    sendButton.addEventListener('click', function() {
        sendMessage();
    });

    function sendMessage() {
        const name = nameInput.value.trim();
        const messageText = messageInput.value.trim();

        if (name !== '' && messageText !== '') {
            const timestamp = new Date().toLocaleTimeString();
            appendMessage(name, messageText, timestamp);

            // Отправка сообщения на сервер
            socket.emit('chatMessage', { sender: name, text: messageText, timestamp });

            // Сохранение сообщения в localStorage
            saveMessages();

            messageInput.value = '';
        }
    }

   function appendMessage(sender, text, timestamp) {
       // Проверяем, есть ли текст в сообщении
       if (text.trim().length === 0) {
           return;
       }

       const messageDiv = document.createElement('div');
       messageDiv.className = 'message-container';
       messageDiv.innerHTML = `
           <div>
               <strong>${sender}:</strong>
               <span>${text}</span>
               <span class="timestamp">${timestamp}</span>
               <button class="delete-button" onclick="deleteItem(this, 'message')">Delete</button>
           </div>`;
       chatMessages.appendChild(messageDiv);
       chatMessages.scrollTop = chatMessages.scrollHeight;
   }


 function saveMessages() {
                                  // Сохранение сообщений в localStorage
                                  const messagesToSave = Array.from(chatMessages.children)
                                      .filter(messageDiv => messageDiv.classList.contains('message-container'))
                                      .map(messageDiv => {
                                          const senderElement = messageDiv.querySelector('strong');
                                          const textElement = messageDiv.querySelector('span');
                                          const timestampElement = messageDiv.querySelector('.timestamp');
                                          return {
                                              sender: senderElement ? senderElement.innerText : '',
                                              text: textElement ? textElement.innerText : '',
                                              timestamp: timestampElement ? timestampElement.innerText : ''
                                          };
                                      });

                                  // Очищаем чат перед обновлением
                                  chatMessages.innerHTML = '';

                                  // Восстанавливаем сообщения из localStorage
                                  messagesToSave.forEach(message => {
                                      appendMessage(message.sender, message.text, message.timestamp);
                                  });

                                  // Прокручиваем вниз, чтобы видеть последнее сообщение
     chatMessages.scrollTop = chatMessages.scrollHeight;
 }



  // Замените вашу функцию loadName на следующий код
  // Замените вашу функцию loadName на следующий код
  function loadName() {
      const savedName = localStorage.getItem('chatName');
      if (savedName) {
          nameInput.value = savedName;
          nameInput.disabled = true;
          alert('Добро пожаловать, ' + savedName + '!');
          addChangeNameButton();
      } else {
          changeName();
      }
  }

  function addChangeNameButton() {
      const changeNameButton = document.createElement('button');
      changeNameButton.innerText = 'Изменить имя';
      changeNameButton.addEventListener('click', function() {
          const password = prompt('Введите пароль для изменения имени:');
          if (password === '3107') {
              const newName = prompt('Введите новое имя:');
              if (newName) {
                  nameInput.value = newName;
                  localStorage.setItem('chatName', newName); // Сохранение нового имени
                  alert('Имя успешно изменено на ' + newName);
              } else {
                  alert('Имя не было изменено.');
              }
          } else {
              alert('Неверный пароль. Изменение имени невозможно.');
          }
      });

      document.getElementById('input-container').appendChild(changeNameButton);
  }

  // Добавьте следующую функцию
  function changeName() {
      const name = prompt('Введите ваше имя:');
      if (name) {
          localStorage.setItem('chatName', name); // Сохранение имени
          nameInput.value = name;
          nameInput.disabled = true;
          alert('Добро пожаловать, ' + name + '!');
          addChangeNameButton();
      } else {
          alert('Имя не было введено.');
      }
  }



    function loadMessages() {
        // Загрузка сообщений из localStorage при загрузке страницы
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            const messagesToLoad = JSON.parse(savedMessages);
            messagesToLoad.forEach(message => {
                appendMessage(message.sender, message.text, message.timestamp);
            });
        }
    }

    // Прослушивание события нового сообщения от сервера
    socket.on('chatMessage', function(data) {
        appendMessage(data.sender, data.text, data.timestamp);
        // После получения нового сообщения обновляем localStorage для сообщений
        saveMessages();
    });

    // Прослушивание события обновления списка участников от сервера
    socket.on('updateParticipants', function(participants) {
        participantsList.innerHTML = `<strong>Participants:</strong> ${participants.join(', ')}`;
    });

    // Добавляем текущего участника при подключении
    function addParticipant() {
        const name = nameInput.value.trim();
        if (name !== '') {
            socket.username = name;
            // Отправляем на сервер информацию о новом участнике
            socket.emit('addParticipant', name);
        }
    }

    // Загрузка сохраненных сообщений из localStorage при загрузке страницы
    loadMessages();

    // Делегирование событий для кнопок удаления
    chatMessages.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-button')) {
            deleteItem(event.target.parentElement);
        }
    });

    function deleteItem(itemDiv) {
        itemDiv.remove();
        // После удаления сообщения обновляем localStorage для сообщений
        saveMessages();
    }
});
