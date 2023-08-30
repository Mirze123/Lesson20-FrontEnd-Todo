const btnSave = document.getElementById('btnSave');
const btnNew = document.getElementById('btnNew');
const btnClose = document.getElementById('btnClose');
const txtId = document.getElementById('txtId');
const txtTitle = document.getElementById('txtTitle');
const txtBody = document.getElementById('txtBody');
const ddlPriority = document.getElementById('ddlPriority');
const ddlStatus = document.getElementById('ddlStatus');
const tblData = document.getElementById('tblData');
const tBody = tblData.getElementsByTagName('tbody')[0];
const hdnRowId = document.getElementById('hdnRowId');
const txtSearch = document.getElementById('txtSearch');


const Mode = {
    insert: 1,
    edit: 2
}

const Priorities = {
    level_1: 1,
    level_2: 2,
    level_3: 3,
    level_4: 4,
    level_5: 5

}

const Messages = {
    addMessage: 'Task Inserted Successfully',
    updateMessage: 'Todo Updated Successfully',
    isExistMessage: 'This id is used before',
    validationSuccessMessage: 'Validation is successfull',
    validationErrorMessage: "You have empty fields"
}

let currentPageMode;

const showSuccessMessage = (message) => {
    swal("Success", message, "success");
}

const showErrorMessage = (message) => {
    swal("Error", message, "error");
}

const saveDataToLS = (data, key) => {

    // check local storage for this key
    // if this key is exists then remove it before saving data
    if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
    }

    //save data to local storage
    localStorage.setItem(key, JSON.stringify(data));
}

const getDataFromLS = (key) => {
    // retrieve data from localstorage and return parsed data
    // if data is null then return empty array
    return localStorage.getItem(key) !== null
        ? JSON.parse(localStorage.getItem(key))
        : [];
}

const validateInputs = (...inputs) => {
    let filteredInput = inputs.filter(x => x.value === '');
    if (filteredInput.length === 0) {
        return {
            isValid: true,
            inputData: null
        }
    }

    return {
        isValid: false,
        inputData: filteredInput
    }

}

const changeInputsBG = (inputs) => {
    inputs.forEach(input => {
        input.style.backgroundColor = 'red';
    });
}


const getTodoFromFields = () => {

    const validationResult = validateInputs(txtId, txtTitle, txtBody, ddlPriority, ddlStatus)


    if (!validationResult.isValid) {
        changeInputsBG(validationResult.inputData);
        return {
            success: false,
            message: Messages.validationErrorMessage,
            data: null
        };
    }

    let id = txtId.value;
    let title = txtTitle.value;
    let body = txtBody.value;
    let priority = ddlPriority.value;
    let status = ddlStatus.value;

    let model = {
        id: id,
        title: title,
        body: body,
        priority: priority,
        status: status
    };

    return {
        success: true,
        message: Messages.validationSuccessMessage,
        data: model
    }
}

const showModalForEdit = (e) => {
    let icon = e.target;
    let tr = icon.closest('tr');
    let id = tr.cells[2].textContent;

    const allData = getDataFromLS('db');

    let filteredObject = allData.find(x => x.id == id);
    txtId.value = filteredObject.id;
    txtTitle.value = filteredObject.title;
    txtBody.value = filteredObject.body;
    ddlPriority.value = filteredObject.priority;
    ddlStatus.value = filteredObject.status;

    currentPageMode = Mode.edit;
    hdnRowId.value = id;

}

const deleteRow = (e) => {
    let icon = e.target;
    let tr = icon.closest('tr');
    let id = tr.cells[2].textContent;

    let allData = getDataFromLS('db');

    allData = allData.filter(x => x.id !== id);
    saveDataToLS(allData, 'db');
    renderTodos(allData);
}

const generatePriorityIcon = (priority, icon) => {
    icon.className = 'fa-solid fa-arrow-up';
    switch (parseInt(priority)) {
        case Priorities.level_1:
            icon.classList.add('rotate180');
            break;
        case Priorities.level_2:
            icon.classList.add('rotate135');
            break;
        case Priorities.level_3:
            icon.classList.add('rotate90');
            break;
        case Priorities.level_4:
            icon.classList.add('rotate45');
            break;
        default:
            break;
    }

}

const createTodo = (todo) => {
    let tr = document.createElement('tr');

    let tdEdit = document.createElement('td');
    let tdRemove = document.createElement('td');
    let tdId = document.createElement('td');
    let tdTitle = document.createElement('td');
    let tdBody = document.createElement('td');
    let tdPriority = document.createElement('td');
    let tdStatus = document.createElement('td');

    tdId.textContent = todo.id;
    tdTitle.textContent = todo.title;
    tdBody.textContent = todo.body;
    tdStatus.textContent = todo.status;

    let iPriority = document.createElement('i');
    tdPriority.appendChild(iPriority);
    generatePriorityIcon(todo.priority, iPriority);

    let iconEdit = document.createElement('i');
    let iconRemove = document.createElement('i');

    iconEdit.className = 'fa-solid fa-edit';
    iconEdit.setAttribute('data-bs-toggle', 'modal');
    iconEdit.setAttribute('data-bs-target', '#staticBackdrop');
    iconEdit.addEventListener('click', showModalForEdit);

    iconRemove.className = 'fa-solid fa-trash-alt';
    iconRemove.addEventListener('click', deleteRow);


    //appending icons to specific td's
    tdEdit.appendChild(iconEdit);
    tdRemove.appendChild(iconRemove);


    // appending all td's into tr
    tr.appendChild(tdEdit);
    tr.appendChild(tdRemove);
    tr.appendChild(tdId);
    tr.appendChild(tdTitle);
    tr.appendChild(tdBody);
    tr.appendChild(tdPriority);
    tr.appendChild(tdStatus);



    return tr;
}

const renderTodos = (dataForRender) => {
    tBody.innerHTML = '';
    dataForRender.forEach(todo => {
        let tr = createTodo(todo);
        tBody.appendChild(tr);
    })
}

const clearFields = () => {
    txtId.value = '';
    txtTitle.value = '';
    txtBody.value = '';
    ddlPriority.selectedIndex = 0;
    ddlStatus.selectedIndex = 0;
}

const edit = () => {
    // write edit codes here

    let allData = getDataFromLS('db');

    let updatedId = hdnRowId.value;
    let updatedRow = allData.find(x => x.id == updatedId);

    updatedRow.id = txtId.value;
    updatedRow.title = txtTitle.value;
    updatedRow.body = txtBody.value;
    updatedRow.priority = ddlPriority.value;
    updatedRow.status = ddlStatus.value;

    saveDataToLS(allData, 'db');
    renderTodos(allData);
    btnClose.click();
    clearFields();
    showSuccessMessage(Messages.updateMessage);

}

const checkForExistence = (id) => {
    return getDataFromLS('db').some(x => x.id == id);
}

const add = () => {
    // write add codes here
    let model = getTodoFromFields();

    if (!model.success) {
        showErrorMessage(model.message);
        return;
    }

    const isExists = checkForExistence(model.data.id);

    if (isExists) {
        showErrorMessage(Messages.isExistMessage);
        return;
    }

    let allData = getDataFromLS('db');

    allData.push(model.data);
    saveDataToLS(allData, 'db');
    renderTodos(allData);
    btnClose.click();
    clearFields();
    showSuccessMessage(Messages.addMessage);
}

const save = () => {
    switch (currentPageMode) {
        case Mode.edit:
            edit();

            break;
        case Mode.insert:
            add();

            break;
        default:
            break;
    }

}

const onFlySearch = (e) => {
    let searchValue = e.target.value;
    let filteredData = getDataFromLS('db').filter(x => x.title.includes(searchValue));
    renderTodos(filteredData);
}

const pageLoad = () => {
    // set insert mode when page is first load
    currentPageMode = Mode.insert;
    btnSave.addEventListener('click', save);
    txtSearch.addEventListener('keyup', onFlySearch);
    btnNew.addEventListener('click', () => {
        currentPageMode = Mode.insert;
    });

    const allData = getDataFromLS('db');
    renderTodos(allData);
}

document.addEventListener('DOMContentLoaded', pageLoad);