// https://developer.mozilla.org/en-US/docs/Web/API/Element
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll

const ARTICLE_TAG = "ARTICLE";
const SECTION_TAG = "SECTION";
const P_TAG = "P";
const UL_TAG = "UL";
const OL_TAG = "OL";
const LI_TAG = "LI";

function isElement(node) {
    node.nodeType === Node.ELEMENT_NODE
}
function isContainer(element) {
    return [ARTICLE_TAG, SECTION_TAG].includes(element.tagName);
}
function isContainerContent(element) {
    return [SECTION_TAG, P_TAG, UL_TAG, OL_TAG].includes(element.tagName)
}
function isArticle(element) {
    return element.tagName === ARTICLE_TAG;
}
function isSection(element) {
    return element.tagName === SECTION_TAG;
}
function isHeading(element) {
    return ["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)
}
function headingTagForSection(section) {
    let depth = 0;
    while (!isArticle(section.parentElement)) {
        depth += 1;
        section = section.parentElement;
    }
    return `H${depth+2}`;
}
function isParagraph(element) {
    return element.tagName == P_TAG;
}
function isList(element) {
    return [UL_TAG, OL_TAG].includes(element.tagName)
}
function isListItem(element) {
    return element.tagName === LI_TAG;
}

function validateDocument(editorRoot) {
    const invalidElements = [];
    for (const child of editorRoot.children) {
        if (!isContainerContent(child)) {
            invalidElements.push(child)
        }
    }
    if (invalidElements.length !== 0) {
        console.log(invalidElements)
        throw new Error("Editor document contains invalid element")
    }
    if (editorRoot.children.length === 0) {
        throw new Error("Editor document does not contain any elements")
    }
    editorRoot.querySelectorAll("section").forEach((section) => {
        if (section.firstElementChild === null) {
            console.log(section);
            throw new Error("Section does not contain header")
        }
        const hTag = headingTagForSection(section);
        let first = true;
        for (const child of section.children) {
            if (first) {
                first = false;
                if (child.tagName !== hTag) {
                    console.log(child)
                    throw new Error("Section does not start with correct header")
                }
            } else {
                if (!isContainerContent(child)) {
                    console.log(child)
                    throw new Error("Section contains invalid element")
                }
            }
        }
    })
    editorRoot.querySelectorAll("ul,ol").forEach((listElement) => {
        if (listElement.children.length === 0) {
            console.log(listElement);
            throw new Error("List has no children")
        }
        for (const child of listElement.children) {
            if (child.tagName !== LI_TAG) {
                console.log(e)
                throw new Error("List contains invalid element")
            }
        }
    })
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
function updateDocumentAttributes(editorRoot) {
    var nextId = 0;
    editorRoot.querySelectorAll("section,p,ul,ol,li").forEach((element) => {
        element.id = `wedit-${nextId}`;
        nextId += 1;
        if (isSection(element)) {
            const heading = element.firstElementChild;
            heading.contentEditable = true;
            heading.spellcheck = true;
        }
        if (isParagraph(element) || isListItem(element)) {
            element.contentEditable = true;
            element.spellcheck = true;
        }
    })
}

// https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event
function beforeInputListener(e) {
    console.log("beforeinput:")
    console.log(e)

    const targetTag = e.target.tagName;
    if (e.inputType === "insertParagraph") {
        const newTag = targetTag.startsWith("H") ? "P" : targetTag;
        const newElement = document.createElement(newTag)
        newElement.spellcheck = true
        newElement.contentEditable = true
        e.target.after(newElement)
        document.getSelection().setPosition(newElement)
        e.preventDefault()
        return;
    }
    if (e.inputType === "deleteContentBackward") {
        if (e.target.textContent === "") {
            const prev = e.target.previousElementSibling;
            document.getSelection().setPosition(prev)
            e.target.remove()
            e.preventDefault()
            return;
        }
    }
    if (e.inputType === "insertText") {
        if (targetTag === P_TAG && e.target.textContent === "*" && e.data === " ") {
            const prev = e.target.previousElementSibling;
            // Create and insert new list
            const newList = document.createElement("UL");
            prev.after(newList);
            // Create and insert new list item
            const newListItem = document.createElement("LI");
            newListItem.spellcheck = true
            newListItem.contentEditable = true
            newList.appendChild(newListItem)
            // Focus new list item and remove old tag
            document.getSelection().setPosition(newListItem)
            e.target.remove()
            e.preventDefault()
            return;
        }
        if (targetTag === P_TAG && e.target.textContent === "1." && e.data === " ") {
            const prev = e.target.previousElementSibling;
            // Create and insert new list
            const newList = document.createElement("OL");
            prev.after(newList);
            // Create and insert new list item
            const newListItem = document.createElement("LI");
            newListItem.spellcheck = true
            newListItem.contentEditable = true
            newList.appendChild(newListItem)
            // Focus new list item and remove old tag
            document.getSelection().setPosition(newListItem)
            e.target.remove()
            e.preventDefault()
            return;
        }
    }
}

function keydownListener(event) {
    console.log("keydown:")
    console.log(event)

    const selection = document.getSelection();
    if (event.key === "ArrowUp") {
        const atStart = true;
        if (atStart) {
            const prev = prevEditable(event.target);
            selection.setPosition(prev)
            scrollToIfNeeded(prev)
            event.preventDefault()
        }
    }
    if (event.key === "ArrowDown") {
        const atEnd = true;
        if (atEnd) {
            const next = nextEditable(event.target);
            selection.setPosition(next)
            scrollToIfNeeded(next)
            event.preventDefault()
        }
    }
}

function scrollToIfNeeded(element) {
    const rect = element.getBoundingClientRect();
    if (rect.y < 0 || rect.bottom > document.documentElement.clientHeight) {
        element.scrollIntoView()
    }
}

function prevEditable(element) {
    if (isListItem(element)) {
        const prevListChild = element.previousElementSibling;
        if (prevListChild !== null) {
            return prevListChild;
        }
        return prevFromSectionChild(element.parentElement);
    }
    return prevFromSectionChild(element);
}
function prevFromSectionChild(element) {
    const prevSectionChild = element.previousElementSibling;
    if (prevSectionChild !== null) {
        if (isSection(prevSectionChild) || isList(prevSectionChild)) {
            return lastSectionDescendent(prevSectionChild);
        }
        return prevSectionChild;
    }
    const parent = element.parentElement;
    const parentParent = parent.parentElement;
    if (isContainer(parentParent)) {
        return prevFromSectionChild(parent);
    }
    return null;
}
function lastSectionDescendent(element) {
    const lastItem = element.lastElementChild;
    if (isSection(lastItem)) {
        return lastSectionDescendent(lastItem);
    }
    if (isList(lastItem)) {
        return lastItem.lastElementChild;
    }
    return lastItem;
}

function nextEditable(element) {
    if (isListItem(element)) {
        const nextListChild = element.nextElementSibling;
        if (nextListChild !== null) {
            return nextListChild;
        }
        return nextFromSectionChild(element.parentElement);
    }
    return nextFromSectionChild(element);
}
function nextFromSectionChild(element) {
    const nextSectionChild = element.nextElementSibling;
    if (nextSectionChild !== null) {
        if (isSection(nextSectionChild) || isList(nextSectionChild)) {
            return nextSectionChild.firstElementChild;
        }
        return nextSectionChild;
    }
    const parent = element.parentElement;
    const parentParent = parent.parentElement;
    if (isContainer(parentParent)) {
        return nextFromSectionChild(parent);
    }
    return null;
}

function onload() {
    console.log("init start")
    const editorRoot = document.getElementById("wedit-root");
    validateDocument(editorRoot)
    updateDocumentAttributes(editorRoot)
    editorRoot.addEventListener("beforeinput", beforeInputListener)
    editorRoot.addEventListener("keydown", keydownListener)
    console.log("init finished")
}

document.addEventListener('DOMContentLoaded', onload, true);