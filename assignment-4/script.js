// define entry object
const entry = {
  name: "",
  email: "",
  tel: "",
};

// define array of entry objects
const entries = [];
entries[0] = {
  name: "Mahmoud ka",
  email: "mahmoud@gmail.com",
  tel: "+4745000000",
};
entries[1] = {
  name: "Tomas",
  email: "Tomas@gmail.com",
  tel: "+4745111111",
};
entries[2] = {
  name: "Layla",
  email: "layla@gmail.com",
  tel: "+4745222222",
};
entries[3] = {
  name: "Isabella",
  email: "Isabella@gmail.com",
  tel: "+4745999999",
};

const contactDivs = document.querySelector(".contact-list"); // div that containes all entries
const search = document.querySelector(".settings input[type='search']"); // search input field
const searchResults = document.querySelector(".search-results"); // search results container
const popup = document.querySelector(".pop-up"); // search results container
const add = document.querySelector(".add"); // add new entry button
const form = document.querySelector(".form"); // input form
const errors = document.querySelectorAll(".error"); // error spans

// create new entry
function createNewEntry(e, parent) {
  const name_text = document.createTextNode(e.name);
  const tel_text = document.createTextNode(e.tel);
  const email_text = document.createTextNode(e.email);

  const name = document.createElement("span");
  name.className = "name";
  const tel = document.createElement("span");
  tel.className = "tel";
  const email = document.createElement("a");
  email.className = "email";
  email.href = `mailto:${e.email}`;

  name.appendChild(name_text);
  tel.appendChild(tel_text);
  email.appendChild(email_text);

  const div = document.createElement("div");
  div.id = `${parent.className}-entry-${parent.children.length}`;
  div.className = "entry";
  div.appendChild(name);
  div.appendChild(tel);
  div.appendChild(email);
  if (parent === contactDivs) {
    const X = document.createElement("sapn");
    X.innerHTML = "Delete &#10060";
    X.className = "delete";
    // delete entry
    X.onclick = function () {
      popup.style.display = "block";
      popup.setAttribute("data-entry", div.id);
    };
    div.appendChild(X);
  }
  parent.appendChild(div);
}
// close pop up
function closePopup() {
  popup.style.display = "none";
}
// delete entry
function deleteEntry() {
  document.getElementById(popup.getAttribute("data-entry")).remove();
  closePopup();
}
// search function
function updateSearch() {
  searchResults.textContent = "";

  if (this.value !== "") {
    const children = Array.from(contactDivs.children);
    children.forEach((e) => {
      let id = e.id.slice(-1);
      if (
        entries[id]["name"].toUpperCase().includes(this.value.toUpperCase())
      ) {
        createNewEntry(entries[id], searchResults);
      } else if (
        entries[id]["tel"].toUpperCase().includes(this.value.toUpperCase())
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

function addNewEntry(e) {
  //   debugger;
  let name = document.forms["form"]["name"];
  let tel = document.forms["form"]["tel"];
  let email = document.forms["form"]["email"];
  let isValid = true;
  errors.forEach((e) => {
    e.textContent = "";
  });
  // validate name
  if (name.value.trim() === "") {
    errors[0].textContent = "* name can not be empty!";
    isValid = false;
  }

  // ensure that email and tel are not both empty
  else if (tel.value.trim() === "" && email.value.trim() === "") {
    errors[1].textContent = "* either telephone or email must be filled!";
    errors[2].textContent = "* either telephone or email must be filled!";
    isValid = false;

    // validate tel
  } else if (
    tel.value.trim() !== "" &&
    !tel.value
      .trim()
      .toLowerCase()
      .match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g)
  ) {
    errors[1].textContent =
      "* phone number can only contain: + - () and space!";

    isValid = false;
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
    isValid = false;
  }
  if (isValid) {
    const newEntry = {
      name: name.value,
      email: email.value,
      tel: tel.value,
    };
    createNewEntry(newEntry, contactDivs);
    errors.forEach((e) => {
      e.textContent = "";
    });
    entries.push(newEntry);
    name.value = "";
    email.value = "";
    tel.value = "";
    toggleInputForm();
  }
  console.log(isValid, name.value, tel.value, email.value);
}

function toggleInputForm() {
  form.classList.toggle("active");
}
window.onload = function () {
  console.table(entries);
  entries.forEach((e) => {
    createNewEntry(e, contactDivs);
  });
};

add.addEventListener("click", toggleInputForm);
search.addEventListener("keyup", updateSearch);
search.addEventListener("blur", updateSearch);
