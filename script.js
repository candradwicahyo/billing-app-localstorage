window.addEventListener("DOMContentLoaded", () => {
  
  let tasks = [];
  
  const content = document.querySelector('.content');
  const inputNameItem = document.querySelector('.input-item');
  const inputPriceItem = document.querySelector('.input-price');
  const modal = document.querySelector('.modal-title');
  const priceText = document.querySelector('.price-text');
  
  // button modal
  // berfungsi untuk mengubah nama judul modal sesuai isi atribut data-type
  // jika judul modal bertuliskan kata add maka jalankan fungsi clear()
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-modal')) {
      const type = event.target.dataset.type.toLowerCase();
      modal.textContent = `modal ${type} data`;
      if (modal.textContent.includes('add')) clear();
    }
  });
  
  // clear value 
  // berfungsi untuk membersihkan isi form input 
  function clear() {
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => form.reset());
  }
  
  // ketika tombol submit ditekan, jalankan fungsi addItem()
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', addItem);
  
  // add item 
  // berfungsi untuk menambahkan item baru
  function addItem() {
    if (modal.textContent.includes('add')) {
      const data = getInputValues();
      if (validate(data) == true) {
        if (isDataExist(data)) return alerts('error', 'Alert', 'Data is already in the list!');
        tasks.unshift(data);
        saveToLocalstorage();
        alerts('success', 'success', 'New item has been added!');
        loadData();
        clear();
      }
    }
  }
  
  // berfungsi menangkap value dari tiap input
  function getInputValues() {
    return { 
      item: inputNameItem.value.trim(),
      price: inputPriceItem.value.trim()
    };
  }
  
  // berfungsi untuk menampilkan data berupa kode HTML 
  function showUI(data, index) {
    const result = renderElement(data, index);
    content.insertAdjacentHTML('beforeend', result);
  }
  
  // berfungsi untuk mengkonversikan integer menjadi mata uang amerika
  function convertToCurrency(price) {
    price = price.toLocaleString('US', { style: 'currency', currency: 'USD' });
    return price;
  }
  
  // berfungsi untuk memvalidasi input sebelum menginputkan data baru atau mengupdate data
  function validate({ item, price }) {
    if (!item && !price) return alerts('error', 'Alert', 'all input is empty!');
    if (!item || !price) return alerts('error', 'Alert', 'input is empty!');
    if (item.length < 2) return tooShort('item', 2); 
    if (item.length > 150) return tooLong('item', 150);
    if (price.match(/[a-zA-Z]/gmi)) return alerts('error', 'Alert', 'field price just only can contain numbers!');
    return true;
  }
  
  // berfungsi untuk menampilkan pesan bahwa field tertentu terlalu pendek
  function tooShort(name, length) {
    return alerts('error', 'Alert', `field ${name} must be more then ${length} character!`);
  }
  
  // berfungsi untuk menampilkan pesan bahwa field tertentu terlalu panjang
  function tooLong(name, length) {
    return alerts('error', 'Alert', `field ${name} must be less then ${length} character!`);
  }
  
  // berfungsi untuk memeriksa, apakah data yang diinput sudah ada sebelumnya atau belum
  function isDataExist({ item, price }) {
    let result = false;
    tasks.forEach(task => {
      if (task.item.toLowerCase() == item.toLowerCase() && task.price == price) result = true;
    });
    return result;
  }
  
  // save to localstorage 
  // berfungsi untuk menyimpan hasil inputan pengguna sementara waktu
  function saveToLocalstorage() {
    localStorage.setItem('billing-app', JSON.stringify(tasks));
  }
  
  // render data menjadi element HTML 
  function renderElement({ item, price }, index) {
    return `
    <tr>
      <td class="p-3 fw-light">${item}</td>
      <td class="p-3 fw-light">${convertToCurrency(parseFloat(price))}</td>
      <td class="p-3 fw-light">
        <button 
          class="btn btn-success btn-sm rounded-0 btn-edit btn-modal m-1" 
          data-type="edit" 
          data-index="${index}"
          data-bs-toggle="modal"
          data-bs-target="#modalBox">
          edit
        </button>
        <button 
        class="btn btn-danger btn-sm rounded-0 btn-delete m-1"
        data-index="${index}">
          delete
        </button>
      </td>
    </tr>
    `;
  }
  
  // plugin / library sweetalert2
  // berfungsi untuk menampilkan pesan seperti fungsi alert() namun dengan style yang lebih baik
  function alerts(icon, title, text, position = 'center') {
    swal.fire ({
      position: position,
      icon: icon,
      title: title,
      text: text
    });
  }
  
  function resetState() {
    priceText.textContent = '';
    content.innerHTML = '';
  }
  
  // load data 
  // berfungsi untuk me-load data yang sudah pernah diinputkan
  function loadData() {
    resetState();
    const item = localStorage.getItem('billing-app');
    tasks = (item) ? JSON.parse(item) : [];
    tasks.forEach((task, index) => {
      updateTotalCost();
      showUI(task, index);
    });
  }
  
  loadData();
  
  // update total cost 
  // berfungsi untuk menampilkan jumlah biaya yang harus dibayarkan
  function updateTotalCost() {
    const result = tasks.map(task => parseFloat(task.price)).reduce((total, number) => total += number, 0);
    priceText.textContent = convertToCurrency(result);
  }
  
  // edit data 
  // berfungai untuk mengupdate data
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-edit')) {
      const index = event.target.dataset.index;
      setValueToInput(index);
      editData(index);
    }
  });
  
  // memgisi value tiap input
  function setValueToInput(index) {
    inputNameItem.value = tasks[index].item;
    inputPriceItem.value = tasks[index].price;
  }
  
  // proses mengupdate data
  function editData(index) {
    btnSubmit.addEventListener('click', () => {
      if (modal.textContent.includes('edit')) {
        const data = getInputValues();
        if (validate(data)) {
          if (isDataExist(data)) return alerts('error', 'Alert', 'Data is already in the list!');
          tasks[index] = data;
          saveToLocalstorage();
          alerts('success', 'success', 'Item has been updated!');
          loadData();
          index = null;
        }
      }
    });
  }
  
  // delete data 
  // berfungsi untuk menghapus data tertentu
  window.addEventListener('click', event => {
    if (event.target.classList.contains('btn-delete')) {
      swal.fire ({
        icon: 'info',
        title: 'are you sure?',
        text: 'do you want to delete this item?',
        showCancelButton: true
      })
      .then(response => {
        const index = event.target.dataset.index;
        if (response.isConfirmed) {
          tasks.splice(index, 1);
          saveToLocalstorage();
          alerts('success', 'success', 'Item has been deleted!');
          loadData();
        }
      });
    }
  });
  
  // delete all item 
  // ketika tombol delete all item ditekan, jalankan fungsi deleteAllItem()
  const btnAll = document.querySelector('.btn-all');
  btnAll.addEventListener('click', deleteAllItem);
  
  // proses untuk menghapus semua data 
  function deleteAllItem() {
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
        loadData();
      }
    });
  }
  
  // search item 
  // berfungsi untuk memfilter data yang cocok sesuai isi input pencarian
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('keyup', function() {
    const value = this.value.trim().toLowerCase();
    searchData(value);
  });
  
  // proses pencarian data yang cocok dengan isi input pencarian
  function searchData(value) {
    const element = Array.from(content.rows);
    element.forEach(data => {
      const str = data.textContent.toLowerCase();
      data.style.display = (str.indexOf(value) != -1) ? '' : 'none';
    });
  }
  
});