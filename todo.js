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
const ddlStatusFilter = document.getElementById('ddlStatusFilter');
const btnExport = document.getElementById('btnExport');
const btnExportPDF = document.getElementById('btnExportPDF');
const ddlColumns = document.querySelector('.js-select2');

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

const Columns = {
    id: 1,
    title: 2,
    body: 3,
    priority: 4,
    status: 5
};

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

    let id = parseInt(txtId.value);
    let title = txtTitle.value;
    let body = txtBody.value;
    let priority = parseInt(ddlPriority.value);
    let status = parseInt(ddlStatus.value);

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

const generateStatusIcon = (icon, todo) => {
    icon.className = 'fa-solid fa-circle';
    if (todo.status == 1) {
        icon.classList.add('color-green');
    }
    else {
        icon.classList.add('color-red');
    }
}

const createBodyTd = (hasChild, cellValue, childElement) => {
    let td = document.createElement('td');
    if (!hasChild) {
        td.textContent = cellValue;
    }
    else {
        let childTag = document.createElement(childElement);
        td.appendChild(childTag);
    }
    return td;
}

const createTodo = (todo) => {
    let tr = document.createElement('tr');

    let tdEdit = document.createElement('td');
    let tdRemove = document.createElement('td');

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

    // get selected columns values
    let selectedColumns = $('.js-select2').val();

    for (const value of selectedColumns) {
        switch (parseInt(value)) {
            case Columns.id:
                tr.appendChild(createBodyTd(false, todo.id, null));
                break;
            case Columns.title:
                tr.appendChild(createBodyTd(false, todo.title, null));
                break;
            case Columns.body:
                tr.appendChild(createBodyTd(false, todo.body, null));
                break;
            case Columns.priority:
                var td = createBodyTd(true, null, 'i');
                var icon = td.children[0];
                generatePriorityIcon(todo.priority, icon);
                tr.appendChild(td);
                break;
            case Columns.status:
                var td = createBodyTd(true, null, 'i');
                var icon = td.children[0];
                generateStatusIcon(icon, todo);
                tr.appendChild(td);
                break;
            default:
                break;
        }
    }
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

    updatedRow.id = parseInt(txtId.value);
    updatedRow.title = txtTitle.value;
    updatedRow.body = txtBody.value;
    updatedRow.priority = parseInt(ddlPriority.value);
    updatedRow.status = parseInt(ddlStatus.value);

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

const generateNewId = () => {
    let allData = getDataFromLS('db');
    let nextId;
    if (allData.length === 0) {
        nextId = 1;
    }
    else {
        let currentLastStep = allData.sort((a, b) => b.id - a.id)[0].id;
        nextId = currentLastStep + 1;
    }

    txtId.value = nextId;
}

const sortColumn = (e) => {
    let orderCase = e.target.dataset.orderCase;
    let orderType = e.target.dataset.orderType;
    let orderDataType = e.target.dataset.orderDataType;
    let allData = getDataFromLS('db');

    if (orderDataType == 'number') {
        allData = allData.sort((a, b) => {
            return orderType == 'asc'
                ? a[orderCase] - b[orderCase]
                : b[orderCase] - a[orderCase];
        })
    }
    else if (orderDataType == 'string') {
        allData = allData.sort((a, b) => {
            return orderType == 'asc'
                ? a[orderCase].localeCompare(b[orderCase])
                : b[orderCase].localeCompare(a[orderCase]);
        });
    }

    renderTodos(allData);

}

const bindOrderEventToIcons = () => {
    const orderIcons = document.querySelectorAll('table th div i');
    orderIcons.forEach(icon => {
        icon.addEventListener('click', sortColumn);
    });
}

const doStatusFilterOperation = (e) => {
    let selectedValue = e.target.value;
    let allData = getDataFromLS('db');

    if (selectedValue != 0) {
        allData = allData.filter(x => x.status == selectedValue);
    }
    renderTodos(allData);
}

const exportToExcel = () => {


    //parse data to json
    var jsonData = getDataFromLS('db');


    //create worksheet
    let workSheet = XLSX.utils.json_to_sheet(jsonData);

    //create workbook
    let workBook = XLSX.utils.book_new();

    //append sheet into workbook with name parameter => 3-rd parameter is sheet name parameter
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet1');

    //generate excel workbook with file name
    XLSX.writeFile(workBook, 'file.xlsx');
}

const exportToPDF = () => {


}

const generateOrderIconsForHeader = (className, colName, orderType, colType) => {
    let i = document.createElement('i');
    i.className = className;
    i.setAttribute('data-order-case', colName.toLowerCase());
    i.setAttribute('data-order-type', orderType);
    i.setAttribute('data-order-data-type', colType.toLowerCase());

    return i;
}

const createHeaderTh = (colName, colType) => {
    let th = document.createElement('th');
    let containerDiv = document.createElement('div');
    let titleSpan = document.createElement('span');
    titleSpan.textContent = colName;
    containerDiv.classList.add('container-header-div');

    let divForIcons = document.createElement('div');
    const iDesc = generateOrderIconsForHeader('fa-solid fa-arrow-up', colName, 'desc', colType);
    const iAsc = generateOrderIconsForHeader('fa-solid fa-arrow-down', colName, 'asc', colType);

    iDesc.classList.add('i-mr');

    divForIcons.appendChild(iDesc);
    divForIcons.appendChild(iAsc);
    containerDiv.appendChild(titleSpan);
    containerDiv.appendChild(divForIcons);
    th.appendChild(containerDiv);
    return th;
}

const generateTableHeader = () => {



    // get tr from thead
    const tr = document.querySelector('#tblData thead tr');

    //clear all th before generating process
    tr.innerHTML = '';

    // create and append initial const th Cell
    const thColspan2 = document.createElement('td');
    thColspan2.colSpan = 2;
    tr.appendChild(thColspan2);

    // get Selected Columns
    const selectedColumns = $('.js-select2').val();


    for (const value of selectedColumns) {
        switch (parseInt(value)) {
            case Columns.id:
                tr.appendChild(createHeaderTh('ID', 'number',))
                break;
            case Columns.title:
                tr.appendChild(createHeaderTh('Title', 'string'));
                break;
            case Columns.body:
                tr.appendChild(createHeaderTh('Body', 'string'));
                break;
            case Columns.priority:
                tr.appendChild(createHeaderTh('Priority', 'number'));
                break;
            case Columns.status:
                tr.appendChild(createHeaderTh('Status', 'number'));
                break;
            default:
                break;
        }
    }
}

const reGenerateTableWithSelectedCols = () => {
    generateTableHeader();
    const allData = getDataFromLS('db');
    renderTodos(allData);
}

const pageLoad = () => {
    // set insert mode when page is first load
    currentPageMode = Mode.insert;

    // check all column in ddl
    $('select[multiple]').multiselect({
        selectAll: true,
        onOptionClick: reGenerateTableWithSelectedCols,
        onSelectAll: reGenerateTableWithSelectedCols
    });
    const aSelectAll = document.querySelector('.ms-options .ms-selectall');
    aSelectAll.click();

    //create table header
    generateTableHeader();

    btnSave.addEventListener('click', save);
    txtSearch.addEventListener('keyup', onFlySearch);
    btnNew.addEventListener('click', () => {
        currentPageMode = Mode.insert;
        generateNewId();
    });
    ddlStatusFilter.addEventListener('change', doStatusFilterOperation)
    btnExport.addEventListener('click', exportToExcel);
    btnExportPDF.addEventListener('click', exportToPDF);



    const allData = getDataFromLS('db');
    renderTodos(allData);

    //set id field disable
    txtId.disabled = true;
    bindOrderEventToIcons();


}

document.addEventListener('DOMContentLoaded', pageLoad);