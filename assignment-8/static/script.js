// define array of entry objects
var entries = {};

const contactDivs = document.querySelector(".contact-list"); // div that containes all entries
const search = document.querySelector(".settings input[type='search']"); // search input field
const searchResults = document.querySelector(".search-results"); // search results container
const popup = document.querySelector(".pop-up"); // search results container
const add = document.querySelector(".add"); // add new entry button
const form = document.querySelector(".form"); // input form
const errors = document.querySelectorAll(".error"); // error spans

// create new entry
function createNewEntry(e, parent) {
  const name_text = document.createTextNode(e.fullname);
  const tel_text = document.createTextNode(e.telephone);
  const email_text = document.createTextNode(e.email);

  const fullname = document.createElement("span");
  fullname.className = "fullname";
  const telephone = document.createElement("span");
  telephone.className = "tel";
  const email = document.createElement("a");
  email.className = "email";
  email.href = `mailto:${e.email}`;

  fullname.appendChild(name_text);
  telephone.appendChild(tel_text);
  email.appendChild(email_text);

  const div = document.createElement("div");
  div.id = `${parent.className}-entry-${e.id}`;
  div.className = "entry";
  div.appendChild(fullname);
  div.appendChild(telephone);
  div.appendChild(email);
  if (parent === contactDivs) {
    const X = document.createElement("sapn");
    X.innerHTML = "Edit";
    X.className = "edit";
    // edit entry
    X.onclick = function () {
      form.classList.add("active");
      form.setAttribute("data-entry", div.id);
      form.setAttribute('data-type','edit');

      var id = parseInt(div.id.split('-').slice(-1));
      var entry = entries[id];
      document.forms["form"]["name"].value = entry.fullname;
      document.forms["form"]["tel"].value = entry.telephone;
      document.forms["form"]["email"].value = entry.email;
    };
    div.appendChild(X);
    const y = document.createElement("sapn");
    y.innerHTML = "Delete &#10060";
    y.className = "delete";
    // delete entry
    y.onclick = function () {
      popup.style.display = "block";
      popup.setAttribute("data-entry", div.id);
      document.forms["form"]["name"].value = '';
      document.forms["form"]["tel"].value = '';
      document.forms["form"]["email"].value = '';
    };
    div.appendChild(y);
  }
  parent.appendChild(div);
}

function updateExistEntry(container_id, entry_id){
  const fullname = document.querySelector(`#${container_id} .fullname`);
  const tel = document.querySelector(`#${container_id} .tel`);
  const email = document.querySelector(`#${container_id} .email`);

  fullname.innerHTML = entries[entry_id].fullname;
  tel.innerHTML = entries[entry_id].telephone;
  email.innerHTML = entries[entry_id].email;
  email.href = `mailto:${entries[entry_id].email}`;
}

// close pop up
function closePopup() {
  popup.style.display = "none";
}

function updateEntry() {
  if(validate()){
    let fullname = document.forms["form"]["name"];
    let telephone = document.forms["form"]["tel"];
    let email = document.forms["form"]["email"];
    
    var token = localStorage.getItem('token');
    if(token == null){
      window.location.href = '/login';
      return;
    }
    var entry_id = form.getAttribute("data-entry");
    var id = parseInt(entry_id.split('-').slice(-1));
    
    var xhr = new XMLHttpRequest();
    var url = `/api/bookings/${id}`;
    xhr.open('PUT', url, true);
    
    var data = new FormData();
    data.append('email', email.value);
    data.append('telephone', telephone.value);
    data.append('fullname', fullname.value);

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var res = JSON.parse(xhr.responseText);
            if(res.success){
              entries[res.data.id]=res.data;
              updateExistEntry(entry_id, id);
              errors.forEach((e) => {
                e.textContent = "";
              });
              fullname.value = "";
              email.value = "";
              telephone.value = "";
              toggleInputForm();
            } else {
              window.location.href = '/';
            }
        }
    }
    xhr.send(data);
    closePopup(); 
  }
}

// delete entry
function deleteEntry() {
  var entry_id = popup.getAttribute("data-entry");
  var id = parseInt(entry_id.split('-').slice(-1));
  
  var token = localStorage.getItem('token');
  if(token == null){
    window.location.href = '/login';
    return;
  }
  var xhr = new XMLHttpRequest();
  var url = `/api/bookings/${id}`;
  xhr.open('DELETE', url, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
          var res = JSON.parse(xhr.responseText);
          if(res.success){
            document.getElementById(entry_id).remove();
            delete entries[id];
          } else {
            window.location.href = '/';
          }
      }
  }
  xhr.send();
  closePopup(); 
}
// search function
function updateSearch() {
  searchResults.textContent = "";

  if (this.value !== "") {
    const children = Array.from(contactDivs.children);
    children.forEach((e) => {
      let id = e.id.split('-').slice(-1);
      if (
        entries[id]["fullname"].toUpperCase().includes(this.value.toUpperCase())
      ) {
        createNewEntry(entries[id], searchResults);
      } else if (
        entries[id]["telephone"].toUpperCase().includes(this.value.toUpperCase())
      ) {
        createNewEntry(entries[id], searchResults);
      } else if (
        entries[id]["email"]
          .toUpperCase()
          .slice(0, entries[id]["email"].indexOf("@"))
          .includes(this.value.toUpperCase())
      ) {
        createNewEntry(entries[id], searchResults);
      }
    });
  }
  if (searchResults.children.length > 0) {
    searchResults.style.border = "2px solid #777";
    searchResults.style.padding = "10px";
    searchResults.style.marginBottom = "15px";
  } else {
    searchResults.style.border = "none";
    searchResults.style.padding = "0";
    searchResults.style.marginBottom = "0";
  }
}

function validate(){
  //   debugger;
  let fullname = document.forms["form"]["name"];
  let telephone = document.forms["form"]["tel"];
  let email = document.forms["form"]["email"];
  errors.forEach((e) => {
    e.textContent = "";
  });
  // validate fullname
  if (fullname.value.trim() === "") {
    errors[0].textContent = "* name can not be empty!";
    return false;
  }

  // ensure that email and telephone are not both empty
  else if (telephone.value.trim() === "" && email.value.trim() === "") {
    errors[1].textContent = "* either telephone or email must be filled!";
    errors[2].textContent = "* either telephone or email must be filled!";
    return false;

    // validate telephone
  } else if (
    telephone.value.trim() !== "" &&
    !telephone.value
      .trim()
      .toLowerCase()
      .match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g)
  ) {
    errors[1].textContent =
      "* phone number can only contain: + - () and space!";

    return false;
  } else if (
    email.value.trim() !== "" &&
    !email.value
      .trim()
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    errors[2].textContent = "* enter a valid email!";
    return false;
  }
  return true;
}

function addNewEntry(e) {
  if(validate()){
    var token = localStorage.getItem('token');
    let fullname = document.forms["form"]["name"];
    let telephone = document.forms["form"]["tel"];
    let email = document.forms["form"]["email"];
    if(token == null){
      window.location.href = '/login';
      return;
    }
    var xhr = new XMLHttpRequest();
    var url = `/api/bookings`;
    xhr.open('POST', url, true);

    var data = new FormData();
    data.append('email', email.value);
    data.append('telephone', telephone.value);
    data.append('fullname', fullname.value);

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var res = JSON.parse(xhr.responseText);
            if(res.success){
              entries[res.data.id]=res.data;
              createNewEntry(res.data, contactDivs);
              errors.forEach((e) => {
                e.textContent = "";
              });
              fullname.value = "";
              email.value = "";
              telephone.value = "";
              toggleInputForm();
              console.table(entries);
            }
        }
    }
    xhr.send(data);
  }
}

function toggleInputForm() {
  if(form.getAttribute('data-type')=="add")
    form.classList.toggle("active");
  form.setAttribute('data-type','add');
  document.forms["form"]["name"].value = '';
  document.forms["form"]["tel"].value = '';
  document.forms["form"]["email"].value = '';
}
window.onload = function () {
  var token = localStorage.getItem('token');
  if(token == null){
    window.location.href = '/login';
    return;
  }
  var xhr = new XMLHttpRequest();
  var url = '/api/bookings';
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
          var res = JSON.parse(xhr.responseText);
          if(res.success){
            res.data.forEach((e) => {
              createNewEntry(e, contactDivs);
              entries[e.id]=e;
            });
            console.table(entries);
          } else {
            window.location.href = '/login';
          }
      }
  }
  xhr.send();
};

function logout(){
  var token = localStorage.getItem('token');
  if(token == null){
    window.location.href = '/login';
    return;
  }

  var xhr = new XMLHttpRequest();
  var url = '/api/logout';
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
  }
  xhr.send();
}

add.addEventListener("click", toggleInputForm);
search.addEventListener("keyup", updateSearch);
search.addEventListener("blur", updateSearch);
