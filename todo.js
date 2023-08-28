const btnSave = document.getElementById('btnSave');
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

const Messages = {
    addMessage:'Task Inserted Successfully',
    updateMessage:'Todo Updated Successfully',
    isExistMessage:'This id is used before'
}

let currentPageMode;
let Datas = [];

const showSuccessMessage = (message) =>{
    swal("Success", message, "success");
}

const showErrorMessage = (message) =>{
    swal("Error", message, "error");
}

const getTodoFromFields = () => {
    let id = txtId.value;
    let title = txtTitle.value;
    let body = txtBody.value;
    let priority = ddlPriority.value;
    let status = ddlStatus.value;

    return {
        id: id,
        title: title,
        body: body,
        priority: priority,
        status: status
    };
}

const showModalForEdit = (e) =>{
    let icon = e.target;
    let tr = icon.closest('tr');
    let id = tr.cells[2].textContent;

    let filteredObject = Datas.find(x=>x.id == id);
    txtId.value = filteredObject.id;
    txtTitle.value = filteredObject.title;
    txtBody.value = filteredObject.body;
    ddlPriority.value = filteredObject.priority;
    ddlStatus.value = filteredObject.status;

    currentPageMode = Mode.edit;
    hdnRowId.value = id;
    
}

const deleteRow = (e) =>{
    let icon = e.target;
    let tr = icon.closest('tr');
    let id = tr.cells[2].textContent;

    Datas = Datas.filter(x=>x.id !== id);
    renderTodos(Datas);
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

    tdId.textContent  = todo.id;
    tdTitle.textContent = todo.title;
    tdBody.textContent = todo.body;
    tdPriority.textContent = todo.priority;
    tdStatus.textContent = todo.status;

    let iconEdit = document.createElement('i');
    let iconRemove = document.createElement('i');

    iconEdit.className = 'fa-solid fa-edit';
    iconEdit.setAttribute('data-bs-toggle','modal');
    iconEdit.setAttribute('data-bs-target','#staticBackdrop');
    iconEdit.addEventListener('click',showModalForEdit);

    iconRemove.className = 'fa-solid fa-trash-alt';
    iconRemove.addEventListener('click',deleteRow);


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

const clearFields = () =>{
    txtId.value = '';
    txtTitle.value = '';
    txtBody.value = '';
    ddlPriority.selectedIndex = 0;
    ddlStatus.selectedIndex = 0;
}

const edit = () => {
    // write edit codes here
    let updatedId = hdnRowId.value;
    let updatedRow = Datas.find(x=>x.id == updatedId);

    updatedRow.id = txtId.value;
    updatedRow.title = txtTitle.value;
    updatedRow.body = txtBody.value;
    updatedRow.priority = ddlPriority.value;
    updatedRow.status = ddlStatus.value;

    renderTodos(Datas);
    btnClose.click();
    clearFields();
    showSuccessMessage(Messages.updateMessage);

}

const checkForExistence = (id) =>{
    return Datas.some(x=>x.id == id);
}

const add = () => {
    // write add codes here
    let todo = getTodoFromFields();
    const isExists =  checkForExistence(todo.id);
    
    if(isExists){
        showErrorMessage(Messages.isExistMessage);
        return;
    }

    Datas.push(todo);
    renderTodos(Datas);
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

const onFlySearch = (e) =>{
    let searchValue = e.target.value;
    let filteredData = Datas.filter(x=>x.title.includes(searchValue));
    renderTodos(filteredData);
}

const pageLoad = () => {
    // set insert mode when page is first load
    currentPageMode = Mode.insert;
    btnSave.addEventListener('click', save);
    txtSearch.addEventListener('keyup',onFlySearch);
}

document.addEventListener('DOMContentLoaded', pageLoad);