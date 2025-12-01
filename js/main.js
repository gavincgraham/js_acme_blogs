function createElemWithText(elementType = "p", newText = "", className) {

    let newElement = document.createElement(elementType);
    newElement.textContent = newText;

    if (className) {
        newElement.classList.add(className);
    }

    return newElement;
}

function createSelectOptions(data) {
    if (data == undefined) {
        return;
    }

    let userArray = [];

    data.forEach(element => {
        let option = document.createElement("option");

        option.value = element.id;
        option.textContent = element.name;

        userArray.push(option)
    });

    return userArray;
}

function toggleCommentSection(postId) {

    if (!postId) {
        return;
    }
    let section = document.querySelector(`section[data-post-id='${postId}']`);

    if (!section) {
        return null;
    }

    section.classList.toggle("hide");

    return section;
}

function toggleCommentButton(postId) {
     if (!postId) {
        return;
    }

    let button = document.querySelector(`button[data-post-id='${postId}']`);

    if (!button) {
        return null;
    }
    
    button.textContent = button.textContent == "Show Comments" ? "Hide Comments" : "Show Comments";

    return button;
}

function deleteChildElements(parentElement) {

    if (!parentElement?.tagName) {
        return;
    }

    let newChild = parentElement.lastElementChild;

    while (newChild) {
        parentElement.removeChild(newChild);
        newChild = parentElement.lastElementChild;
    }

    return parentElement;
}

function addButtonListeners() {
    let buttons = document.querySelectorAll("main button");

    buttons.forEach(button => {
        let postId = button.dataset.postId;

        if (postId) {
            button.addEventListener("click", function (e) {toggleComments(e, postId)},
        false);
        }
    });

    return buttons;
}

function removeButtonListeners() {
    let buttons = document.querySelectorAll("main button");

    buttons.forEach(button => {
        let postId = button.dataset.id;

        if (postId) {
            button.removeEventListener("click", function (e) {toggleComments(e, postId)},
        false);
        }
    });

    return buttons;
}


function createComments(comments) {

    if (!comments)
    {
        return;
    }
    let fragment = document.createDocumentFragment();

    comments.forEach(comment => {
        let article = document.createElement("article");

        let h3 = createElemWithText("h3", comment.name);

        let bodyParagraph = createElemWithText("p", comment.body);

        let emailParagraph = createElemWithText('p', `From: ${comment.email}`);

        article.append(h3, bodyParagraph, emailParagraph);

        fragment.appendChild(article);

    });

    return fragment;
}

function populateSelectMenu(users) {
    if (!users) {
        return;
    }

    let selectMenu = document.getElementById("selectMenu");


    let newOptions = createSelectOptions(users);

    newOptions.forEach(option => {
        selectMenu.appendChild(option);
    });

    return selectMenu;
}


const getUsers = async () => {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users`);

        if (!response.ok) throw new Error("HTTP Error has occurred");
        const jsonUserData = await response.json();
        return jsonUserData
    } catch (err) {
        console.error(err);
    }
    
}

const getUserPosts = async (userId) => {
    if (!userId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);

        if (!response.ok) throw new Error("HTTP Error has occurred");
        const jsonUserData = await response.json();
        return jsonUserData;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}


const getUser = async (userId) => {

    if (!userId) {
        return;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);

        if (!response.ok) throw new Error("HTTP Error has occurred");
        const jsonUserData = await response.json();
        return jsonUserData
    } catch (err) {
        console.error(err);
    }
    
}

const getPostComments = async (postId) => {

    if (!postId) {
        return;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);

        if (!response.ok) throw new Error("HTTP Error has occurred");
        const jsonUserData = await response.json();
        return jsonUserData
    } catch (err) {
        console.error(err);
    }
    
}

const displayComments = async (postId) => {

    if (!postId) {
        return;
    }
    
    let section = document.createElement("section");

    section.dataset.postId = postId;
    
    section.classList.add("comments", "hide");

    let comments = await getPostComments(postId);

    let fragment = createComments(comments);

    section.appendChild(fragment);

    return section;
}

const createPosts = async (posts) => {

    if (!posts) {
        return;
    }
    
    let fragment = document.createDocumentFragment();

    for (const post of posts) {
        let article = document.createElement("article");

        let h2 = createElemWithText("h2", post.title);

        let bodyParagraph = createElemWithText("p", post.body);

        let idParagraph = createElemWithText("p", `Post ID: ${post.id}`);

        let author = await getUser(post.userId);

        let authorParagraph = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);

        let phraseParagraph = createElemWithText("p", `${author.company.catchPhrase}`);

        let button = createElemWithText("button", "Show Comments");

        button.dataset.postId = post.id;

        let section = await displayComments(post.id);

        article.append(h2, bodyParagraph, idParagraph, authorParagraph, phraseParagraph, button, section);

        fragment.appendChild(article);

    }

    return fragment;
}


const displayPosts = async (posts) => {
    let main = document.querySelector("main");
    let element;

    if (posts) {
        element = await createPosts(posts);
    } else {
        element = createElemWithText("p", "Select an Employee to display their posts.", "default-text");
    }

    main.append(element);

    return element;
}

function toggleComments(event, postId) {

    if (!event || !postId) {
        return;
    }
    event.target.listener = true;

    let section = toggleCommentSection(postId);

    let button = toggleCommentButton(postId);

    return [section, button];
}

const refreshPosts = async (posts) => {
    if (!posts) {
        return undefined;
    }

    let buttons = removeButtonListeners();

    let main = deleteChildElements(document.querySelector("main"));

    let fragment = await displayPosts(posts);

    let addButtons = addButtonListeners();

    return [buttons, main, fragment, addButtons];
}

const selectMenuChangeEventHandler = async (event) => {
    if (!event) {
        return undefined;
    }
    
    const userId = Number(event?.target?.value) || 1;
    
    if (event.target) {
        event.target.disabled = true;
    }

    const posts = await getUserPosts(userId);
    
    const refreshPostsArray = await refreshPosts(posts);

    if (event.target) {
        event.target.disabled = false;
    }

    return [userId, posts, refreshPostsArray];
}

const initPage = async () => {
    let users = await getUsers();

    let select = populateSelectMenu(users);

    return [users, select];
}

function initApp () {
     initPage();

    const selectMenu = document.getElementById("selectMenu");

    if (selectMenu) {
        selectMenu.addEventListener("change", selectMenuChangeEventHandler);
    }
}

document.addEventListener("DOMContentLoaded", initApp);