let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let loginAttempts = 0;


function saveDataToStorage() {
    localStorage.setItem('users', JSON.stringify(users));
}

function getUserByUsername(username) {
    return users.find(user => user.username === username);
}

function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        text: message,
        customClass: {
            popup: 'swal2-popup',
        },
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        customClass: {
            popup: 'swal2-popup',
        },
    });
}

function loginUser(username, password) {
    if (loginAttempts < 3) {
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            currentUser = user;
            showDashboard();
        } else {
            loginAttempts++;
            if (loginAttempts === 3) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: "Se han excedido los intentos de inicio de sesión. El formulario ha sido bloqueado.",
                    customClass: {
                        popup: 'swal2-popup',
                    },
                });
                
                disableLoginForm();  // Función para bloquear el formulario
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Contraseña incorrecta. Intento ${loginAttempts}/3. Por favor, inténtelo de nuevo.`,
                    customClass: {
                        popup: 'swal2-popup',
                    },
                });
            }
        }
    }
}
function disableLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('#loginForm button');

    loginForm.reset();  // Limpiar los campos del formulario
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    submitButton.disabled = true;
}


function registerUser(username, password, confirmPassword) {
    if (password === confirmPassword) {
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            showErrorAlert("Este usuario ya existe. Por favor, elige otro nombre de usuario.");
        } else {
            const initialDeposit = parseFloat(prompt("Ingrese la cantidad para la apertura de cuenta:"));
            if (initialDeposit >= 100000) {
                const newUser = { username, password, accountBalance: initialDeposit, transactionHistory: [] };
                users.push(newUser);
                currentUser = newUser;
                saveDataToStorage();
                showSuccessAlert("Registro exitoso. Bienvenido a Grupo Unión Finanzas.");
                showDashboard();
            } else {
                showErrorAlert("La apertura de cuenta debe ser de al menos 100,000 pesos.");
            }
        }
    } else {
        showErrorAlert("Las contraseñas no coinciden. Inténtalo de nuevo.");
    }
}

function checkBalance() {
    Swal.fire ({ 
        title: "Saldo actual:\n",
        text: "$ "+currentUser.accountBalance,
        icon: "info"
    });
}

function withdraw() {
    const amount = parseFloat(prompt("Ingrese la cantidad a retirar:"));
    if (amount && amount > 0 && amount <= currentUser.accountBalance) {
        currentUser.accountBalance -= amount;
        currentUser.transactionHistory.push(`Retiro: -$${amount}`);
        (`Retiro exitoso. Saldo actual: $${currentUser.accountBalance}`);
        saveDataToStorage();
        showDashboard();
    } else {
        showErrorAlert("Cantidad inválida o insuficiente saldo.");
    }
}

function transfer() {
    const targetUsername = prompt("Ingrese el nombre de usuario al que desea transferir:");
    const targetUser = getUserByUsername(targetUsername);

    if (!targetUser) {
        showErrorAlert("El usuario de destino no existe.");
        return;
    }

    const amount = parseFloat(prompt("Ingrese la cantidad a transferir:"));

    if (amount && amount > 0 && amount <= currentUser.accountBalance) {
        currentUser.accountBalance -= amount;
        currentUser.transactionHistory.push(`Transferencia a ${targetUsername}: -$${amount}`);
        
        targetUser.accountBalance += amount;
        targetUser.transactionHistory.push(`Transferencia de ${currentUser.username}: +$${amount}`);

        showSuccessAlert(`Transferencia exitosa. Saldo actual: $${currentUser.accountBalance}`);
        saveDataToStorage();
        showDashboard();
    } else {
        showErrorAlert("Transferencia no válida. Verifique el nombre de usuario de destino y la cantidad.");
    }
}

function deposit() {
    const amount = parseFloat(prompt("Ingrese la cantidad a consignar:"));
    if (amount && amount > 0) {
        currentUser.accountBalance += amount;
        currentUser.transactionHistory.push(`Consignación: +$${amount}`);
        showSuccessAlert(`Consignación exitosa. Saldo actual: $${currentUser.accountBalance}`);
        saveDataToStorage();
        showDashboard();
    } else {
        showErrorAlert("Cantidad inválida.");
    }
}

function viewHistory() {
    {
        Swal.fire ({ 
            title: "Historial de Movimientos:\n",
            text: currentUser.transactionHistory.join("\n"),
            icon: "info"
        });
    }
}

function logout() {
    currentUser = null;
    showLoginForm();
}

function showLoginForm() {
    const mainContainer = document.getElementById('main-container');
    mainContainer.innerHTML = `
    <form id="loginForm" class="mx-auto m-4 my-4" style="max-width: 400px;">
    <div class="mb-3">
        <label for="username" class="form-label">Usuario:</label>
        <input type="text" class="form-control" id="username" required>
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Contraseña:</label>
        <input type="password" class="form-control" id="password" required>
    </div>
    <button type="button" class="btn btn-primary" onclick="submitLoginForm()">Iniciar Sesión</button>
</form>
<p>¿No tienes una cuenta? <a href="#" onclick="showRegistrationForm()">Regístrate</a></p>
    `;
}

function showRegistrationForm() {
    const mainContainer = document.getElementById('main-container');
    mainContainer.innerHTML = `
        <form id="registrationForm" class="mx-auto m-4 my-4" style="max-width: 400px;">
        <div class="mb-3">
            <label class="form-label" for="newUsername">Nuevo Usuario:</label>
            <input class="form-control" type="text" id="newUsername" required>
        </div>
        <div class="mb-3">
            <label class="form-label" for="newPassword">Contraseña:</label>
            <input class="form-control" type="password" id="newPassword" required>
        </div>
        <div class="mb-3">
            <label class="form-label"for="confirmPassword">Confirmar Contraseña:</label>
            <input class="form-control" type="password" id="confirmPassword" required>
        </div>
            <button class="btn btn-primary" type="button" onclick="submitRegistrationForm()">Registrarse y Abrir Cuenta</button>
        </form>
        <p>¿Ya tienes una cuenta? <a href="#" onclick="showLoginForm()">Iniciar Sesión</a></p>
    `;
}

function submitLoginForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginUser(username, password);
}

function submitRegistrationForm() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    registerUser(newUsername, newPassword, confirmPassword);
}

function showDashboard() {
    const mainContainer = document.getElementById('main-container');
    mainContainer.innerHTML = `
        <h2>Bienvenido, ${currentUser.username}!</h2>
        <p>Saldo actual: $${currentUser.accountBalance}</p>
        <button class="btn btn-info" onclick="checkBalance()">Consultar Saldo</button>
        <button class="btn btn-primary" onclick="withdraw()">Retirar Dinero</button>
        <button class="btn btn-primary" onclick="transfer()">Transferir Dinero</button>
        <button class="btn btn-primary" onclick="deposit()">Consignar Dinero</button>
        <button class="btn btn-info" onclick="viewHistory()">Ver Historial</button>
        <button class="btn btn-danger" onclick="logout()">Cerrar Sesión</button>
    `;
}

document.addEventListener('DOMContentLoaded', showLoginForm);