window.onload = () => {
  
  let tasks = [];
  
  const content = document.querySelector('.content');
  const inputNameItem = document.querySelector('.input-item');
  const inputPriceItem = document.querySelector('.input-price');
  const modal = document.querySelector('.modal-title');
  
  // load data 
  function loadData() {
    content.innerHTML = '';
    const item = localStorage.getItem('billing-app');
    tasks = (item) ? JSON.parse(item) : [];
    tasks.forEach(task => {
      const result = renderElement(task);
      content.insertAdjacentHTML('beforeend', result);
      updateTotalCost();
    });
  }
  
  loadData();
  
  // button modal
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-modal')) {
      const type = event.target.dataset.type.toLowerCase();
      modal.textContent = `modal ${type} data`;
      if (modal.textContent.includes('add')) clear();
    }
  });
  
  // clear value 
  function clear() {
    inputNameItem.value = '';
    inputPriceItem.value = '';
  }
  
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', addItem);
  
  // add item 
  function addItem() {
    if (modal.textContent.includes('add')) {
      const nameItem = inputNameItem.value.trim();
      const priceItem = inputPriceItem.value.trim();
      if (validate(nameItem, priceItem) == true) {
        const item = { item: nameItem, price: parseFloat(priceItem) }
        tasks.push(item);
        saveToLocalstorage();
        const result = renderElement(item);
        content.insertAdjacentHTML('beforeend', result);
        alerts('success', 'success', 'New item has been added!');
        updateTotalCost();
        loadData();
        clear();
      }
    }
  }
  
  function validate(item, price) {
    if (!item && !price) return alerts('error', 'Alert', 'field\'s was empty!');
    if (!item || !price) return alerts('error', 'Alert', 'field was empty!');
    if (item.length < 2) return tooShort('item', 2); 
    if (item.length > 150) return tooLong('item', 150);
    if (price.match(/[a-zA-Z]/gmi)) return alerts('error', 'Alert', 'field price just only can contain numbers!');
    return true;
  }
  
  function tooShort(name, length) {
    return alerts('error', 'Alert', `field ${name} must be more then ${length} character!`);
  }
  
  function tooLong(name, length) {
    return alerts('error', 'Alert', `field ${name} must be less then ${length} character!`);
  }
  
  // save to localstorage 
  function saveToLocalstorage() {
    localStorage.setItem('billing-app', JSON.stringify(tasks));
  }
  
  function renderElement({ item, price }) {
    return `
    <tr>
      <td class="p-3 fw-light">${item}</td>
      <td class="p-3 fw-light">$${price}</td>
      <td class="p-3 fw-light">
        <button 
          class="btn btn-success btn-sm rounded-0 btn-edit btn-modal m-1" 
          data-type="edit" 
          data-bs-toggle="modal"
          data-bs-target="#modalBox">
          edit
        </button>
        <button class="btn btn-danger btn-sm rounded-0 btn-delete m-1">
          delete
        </button>
      </td>
    </tr>
    `;
  }
  
  // plugin sweetalert2
  function alerts(icon, title, text, position = 'center') {
    swal.fire ({
      position: position,
      icon: icon,
      title: title,
      text: text
    });
  }
  
  // update total cost 
  function updateTotalCost() {
    let number = 0;
    tasks.forEach(task => number += task.price);
    const text = document.querySelector('.price-text');
    text.textContent = `$${number}`;
  }
  
  // edit data 
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-edit')) {
      const tr = event.target.parentElement.parentElement;
      setValueToInput(tr.cells);
      editData(tr);
    }
  });
  
  function setValueToInput(param) {
    inputNameItem.value = param[0].textContent;
    inputPriceItem.value = filter(param[1].textContent);
  }
  
  function filter(param) {
    const parts = param.split('$');
    return parts[parts.length - 1].trim();
  }
  
  function editData(param) {
    btnSubmit.addEventListener('click', () => {
      if (modal.textContent.includes('edit')) {
        const nameItem = inputNameItem.value.trim();
        const priceItem = inputPriceItem.value.trim();
        if (validate(nameItem, priceItem) == true) {
          tasks[param.rowIndex - 1].item = nameItem;
          tasks[param.rowIndex - 1].price = parseFloat(priceItem);
          saveToLocalstorage();
          alerts('success', 'success', 'Item has been updated!');
          updateTotalCost();
          loadData();
        }
      }
    });
  }
  
  // delete data 
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-delete')) {
      // plugin sweetalert2
      swal.fire ({
        icon: 'info',
        title: 'are you sure?',
        text: 'do you want to delete this item?',
        showCancelButton: true
      })
      .then(response => {
        const tr = event.target.parentElement.parentElement;
        if (response.isConfirmed) deleteData(tr);
      })
    }
  });
  
  function deleteData(param) {
    tasks.splice((param.rowIndex - 1), 1);
    saveToLocalstorage();
    alerts('success', 'success', 'Item has been deleted!');
    updateTotalCost();
    loadData();
  }
  
  // delete all item 
  const btnAll = document.querySelector('.btn-all');
  btnAll.addEventListener('click', deleteAllItem);
  
  function deleteAllItem() {
    // plugin sweetalert2
    swal.fire ({
      icon: 'info',
      title: 'are you sure?',
      text: 'do you want to delete all item?',
      showCancelButton: true
    })
    .then(response => {
      if (response.isConfirmed) {
        tasks = [];
        saveToLocalstorage();
        alerts('success', 'success', 'All item has been deleted!');
        updateTotalCost();
        loadData();
      }
    });
  }
  
  // search item 
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('keyup', function() {
    const value = this.value.trim().toLowerCase();
    const element = Array.from(content.rows);
    element.forEach(data => {
      const str = data.textContent.toLowerCase();
      data.style.display = (str.indexOf(value) != -1) ? '' : 'none';
    });
  });
  
}