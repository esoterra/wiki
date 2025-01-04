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
function beforeInputListener(event) {
    console.log("beforeinput:")
    console.log(event)

    const target = event.target;
    const targetTag = event.target.tagName;
    const targetContent = event.target.textContent;
    const data = event.data;
    if (event.inputType === "insertParagraph") {
        if (isListItem(target)) {
            if (targetContent === "") {
                splitList(target)
                event.preventDefault();
                return;
            }
        }
        const newTag = targetTag.startsWith("H") ? "P" : targetTag;
        const newElement = document.createElement(newTag)
        newElement.spellcheck = true
        newElement.contentEditable = true
        event.target.after(newElement)
        document.getSelection().setPosition(newElement)
        event.preventDefault()
        return;
    }
    if (event.inputType === "deleteContentBackward") {
        if (event.target.textContent === "") {
            const prev = event.target.previousElementSibling;
            document.getSelection().setPosition(prev)
            event.target.remove()
            event.preventDefault()
            return;
        }
    }
    if (event.inputType === "insertText") {
        if (targetTag === P_TAG && targetContent === "*" && data === " ") {
            const prev = event.target.previousElementSibling;
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
            event.target.remove()
            event.preventDefault()
            return;
        }
        if (targetTag === P_TAG && targetContent === "1." && data === " ") {
            const prev = event.target.previousElementSibling;
            // Create and insert new list
            const newList = document.createElement(OL_TAG);
            prev.after(newList);
            // Create and insert new list item
            const newListItem = document.createElement(LI_TAG);
            newListItem.spellcheck = true
            newListItem.contentEditable = true
            newList.appendChild(newListItem)
            // Focus new list item and remove old tag
            document.getSelection().setPosition(newListItem)
            event.target.remove()
            event.preventDefault()
            return;
        }
    }
}

function splitList(element) {
    const parentList = element.parentElement;
    // Add all elements after this one in the list to the `after` list and remove them from the parent
    let current = element.nextElementSibling;
    const remainder = [];
    while (current != null) {
        remainder.push(current)
        current = current.nextElementSibling;
    }
    // Create and select the new paragraph element
    element.remove()
    const newParagraph = document.createElement(P_TAG);
    newParagraph.spellcheck = true
    newParagraph.contentEditable = true
    parentList.after(newParagraph);
    document.getSelection().setPosition(newParagraph)
    // Create the list for the remainder
    const newList = document.createElement(parentList.tagName);
    for (const current of remainder) {
        newList.appendChild(current)
    }
    newParagraph.after(newList)
}

function keydownListener(event) {
    console.log("keydown:")
    console.log(event)

    const target = event.target;
    const selection = document.getSelection();
    if (event.key === "ArrowUp" && atStart(event)) {
        const prev = prevEditable(target);
        if (prev === null) {
            return;
        }
        selectEnd(prev)
        scrollToIfNeeded(prev)
        event.preventDefault()
        return;
    }
    if (event.key === "ArrowDown" && atEnd(event)) {
        const next = nextEditable(event.target);
        if (next === null) {
            return;
        }
        selection.setPosition(next)
        scrollToIfNeeded(next)
        event.preventDefault()
        return;
    }
    if (event.key === "Tab") {
        if (event.shiftKey) {
            console.log("TODO: Indent List")
        } else {
            console.log("TODO: Dedent List")
        }
        event.preventDefault()
    }
}

function atStart(event) {
    if (event.target.textContent == "") {
        return true;
    }
    const selection = document.getSelection();
    if (selection.rangeCount === 1) {
        const selectionRange = selection.getRangeAt(0);
        return selectionRange.startOffset === 0;
    }
    console.warn("More than one selection!!")
    return false;
}

function atEnd(event) {
    const target = event.target;
    if (target.textContent === "") {
        return true;
    }
    const selection = document.getSelection();
    if (selection.rangeCount === 1) {
        const selectionRange = selection.getRangeAt(0);
        const comparison = selectionRange.comparePoint(target.lastChild, target.lastChild.length);
        return comparison === 0;
    }
    return false;
}

function selectEnd(element) {
    const selection = document.getSelection();
    if (element.textContent === "") {
        console.log("selecting end of empty which is just the whole thing")
        selection.setPosition(element)
        return;
    }
    if (element.lastChild !== null) {
        console.log("selecting the end of the lastChild")
        console.log(element)
        console.log(element.lastChild)
        selection.setPosition(element.lastChild, element.lastChild.length)
        return;
    }
    selection.setPosition(element)
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
