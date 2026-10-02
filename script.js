const SAMPLE_VALUES = [42, 23, 68, 12, 31, 55, 79];

const insertForm = document.getElementById('insert-form');
const numberInput = document.getElementById('number-input');
const treeCanvas = document.getElementById('tree-canvas');
const emptyTree = document.getElementById('empty-tree');
const nodeCount = document.getElementById('node-count');
const journeyList = document.getElementById('journey-list');
const traversalValues = document.getElementById('traversal-values');
const traversalCount = document.getElementById('traversal-count');
const traversalName = document.getElementById('traversal-name');
const traversalDescription = document.getElementById('traversal-description');
const traversalStatus = document.getElementById('traversal-status');
const playButton = document.getElementById('traversal-play');
const announcement = document.getElementById('announcement');

const TRAVERSALS = {
    preorder: {
        name: '前序走訪',
        description: '先拜訪根節點，再走左子樹，最後走右子樹。'
    },
    inorder: {
        name: '中序走訪',
        description: '先走左子樹，再拜訪根節點，最後走右子樹。'
    },
    postorder: {
        name: '後序走訪',
        description: '先走完左、右子樹，最後才拜訪根節點。'
    }
};

let root = null;
let nodeTotal = 0;
let activeSteps = [];
let lastInserted = null;
let traversalType = 'preorder';
let traversalIndex = -1;
let traversalTimer = null;

function makeNode(value) {
    return { value, left: null, right: null };
}

function insertValue(value) {
    const steps = [];

    if (!root) {
        root = makeNode(value);
        nodeTotal += 1;
        return { inserted: true, steps };
    }

    let current = root;
    while (true) {
        const direction = value < current.value ? 'left' : value > current.value ? 'right' : 'same';
        steps.push({ compared: current.value, direction });

        if (direction === 'same') {
            return { inserted: false, steps };
        }

        if (current[direction]) {
            current = current[direction];
        } else {
            current[direction] = makeNode(value);
            nodeTotal += 1;
            return { inserted: true, steps };
        }
    }
}

function getInorder(node, values = []) {
    if (!node) return values;
    getInorder(node.left, values);
    values.push(node.value);
    getInorder(node.right, values);
    return values;
}

function getTraversal(node, type, values = []) {
    if (!node) return values;
    if (type === 'preorder') values.push(node.value);
    getTraversal(node.left, type, values);
    if (type === 'inorder') values.push(node.value);
    getTraversal(node.right, type, values);
    if (type === 'postorder') values.push(node.value);
    return values;
}

function stopTraversal() {
    if (traversalTimer !== null) {
        window.clearInterval(traversalTimer);
        traversalTimer = null;
    }
    playButton.textContent = '▶ 播放走訪';
}

function svgElement(name, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
}

function getPositions() {
    const positions = new Map();
    let order = 0;
    let deepestLevel = 0;

    function visit(node, depth, parent = null) {
        if (!node) return;
        deepestLevel = Math.max(deepestLevel, depth);
        visit(node.left, depth + 1, node);
        positions.set(node.value, {
            x: 50 + order * 84,
            y: 48 + depth * 92,
            parent
        });
        order += 1;
        visit(node.right, depth + 1, node);
    }

    visit(root, 0);
    return { positions, deepestLevel };
}

function renderTree() {
    const { positions, deepestLevel } = getPositions();
    const width = Math.max(600, nodeTotal * 84 - 12);
    const height = root ? Math.max(270, (deepestLevel + 1) * 92 + 64) : 270;

    treeCanvas.replaceChildren();
    treeCanvas.setAttribute('viewBox', `0 0 ${width} ${height}`);
    treeCanvas.setAttribute('width', String(width));
    treeCanvas.setAttribute('height', String(height));
    treeCanvas.setAttribute(
        'aria-label',
        root ? `二元搜尋樹，共 ${nodeTotal} 個節點` : '二元搜尋樹，目前尚無節點'
    );
    emptyTree.hidden = Boolean(root);
    treeCanvas.hidden = !root;
    nodeCount.textContent = `${nodeTotal} 個節點`;

    if (root) {
        const edgeLayer = svgElement('g', { class: 'edge-layer' });
        const nodeLayer = svgElement('g', { class: 'node-layer' });
        const traversalOrder = new Map(
            getTraversal(root, traversalType).map((value, index) => [value, index])
        );

        positions.forEach((position, value) => {
            if (!position.parent) return;
            const parentPosition = positions.get(position.parent.value);
            const onRoute = activeSteps.some((step, index) => (
                step.compared === position.parent.value &&
                step.direction === (value < position.parent.value ? 'left' : 'right') &&
                (index < activeSteps.length - 1 || lastInserted === value)
            ));
            edgeLayer.append(svgElement('line', {
                x1: parentPosition.x,
                y1: parentPosition.y + 23,
                x2: position.x,
                y2: position.y - 23,
                class: onRoute ? 'tree-edge is-route' : 'tree-edge'
            }));
        });

        positions.forEach((position, value) => {
            const onRoute = activeSteps.some((step) => step.compared === value);
            const isNew = lastInserted === value;
            const visitIndex = traversalOrder.get(value);
            const isVisited = traversalIndex >= 0 && visitIndex < traversalIndex;
            const isTraversalCurrent = traversalIndex === visitIndex;
            const group = svgElement('g', {
                class: `tree-node${onRoute ? ' is-route' : ''}${isNew ? ' is-new' : ''}${isVisited ? ' is-visited' : ''}${isTraversalCurrent ? ' is-traversal-current' : ''}`,
                transform: `translate(${position.x} ${position.y})`
            });
            const circle = svgElement('circle', { r: 22 });
            const label = svgElement('text', { 'text-anchor': 'middle', dy: '0.36em' });
            label.textContent = String(value);
            group.append(circle, label);
            nodeLayer.append(group);
        });

        treeCanvas.append(edgeLayer, nodeLayer);
    }

    renderTraversal();
}

function renderTraversal() {
    const values = getTraversal(root, traversalType);
    const traversal = TRAVERSALS[traversalType];
    traversalValues.replaceChildren();
    traversalName.textContent = traversal.name;
    traversalDescription.textContent = traversal.description;
    traversalCount.textContent = `${traversalIndex < 0 ? 0 : Math.min(traversalIndex + 1, values.length)} / ${values.length}`;

    if (values.length === 0) {
        const hint = document.createElement('span');
        hint.className = 'traversal-empty';
        hint.textContent = '先種幾個數字，再來走訪這棵樹。';
        traversalValues.append(hint);
    } else {
        values.forEach((value, index) => {
            const chip = document.createElement('span');
            chip.className = `traversal-chip${index < traversalIndex ? ' is-visited' : ''}${index === traversalIndex ? ' is-current' : ''}`;
            chip.setAttribute('aria-label', `第 ${index + 1} 個：${value}`);
            const order = document.createElement('small');
            order.textContent = String(index + 1).padStart(2, '0');
            const number = document.createElement('strong');
            number.textContent = String(value);
            chip.append(order, number);
            traversalValues.append(chip);
        });
    }

    document.querySelectorAll('.traversal-tab').forEach((button) => {
        const selected = button.dataset.traversal === traversalType;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });

    const disabled = values.length === 0;
    document.getElementById('traversal-previous').disabled = disabled || traversalIndex <= 0;
    document.getElementById('traversal-next').disabled = disabled || traversalIndex >= values.length;
    playButton.disabled = disabled;

    if (disabled) {
        traversalStatus.textContent = '先種幾個數字，再來走訪這棵樹。';
    } else if (traversalIndex < 0) {
        traversalStatus.textContent = '按「播放走訪」或「下一步」，看節點依序亮起。';
    } else if (traversalIndex >= values.length) {
        traversalStatus.textContent = `走訪完成！拜訪順序：${values.join(' → ')}`;
    } else {
        traversalStatus.textContent = `第 ${traversalIndex + 1} / ${values.length} 步：拜訪節點 ${values[traversalIndex]}`;
    }
}

function advanceTraversal() {
    const values = getTraversal(root, traversalType);
    if (traversalIndex < values.length) {
        traversalIndex += 1;
        renderTree();
    }
    if (traversalIndex >= values.length) stopTraversal();
}

function renderJourney(value, steps, inserted) {
    journeyList.replaceChildren();

    if (steps.length === 0 && inserted) {
        const item = document.createElement('li');
        item.className = 'journey-item';
        item.textContent = `空地上沒有節點，${value} 成為樹根。`;
        journeyList.append(item);
        return;
    }

    steps.forEach((step, index) => {
        const item = document.createElement('li');
        item.className = 'journey-item';
        const comparison = document.createElement('span');
        comparison.className = 'comparison';
        comparison.textContent = `${value} ${step.direction === 'left' ? '<' : step.direction === 'right' ? '>' : '='} ${step.compared}`;
        const decision = document.createElement('span');
        decision.className = step.direction === 'same' ? 'decision is-match' : 'decision';
        decision.textContent = step.direction === 'left'
            ? `比較第 ${index + 1} 次 · 往左走`
            : step.direction === 'right'
                ? `比較第 ${index + 1} 次 · 往右走`
                : '數字已經在樹裡了';
        item.append(comparison, decision);
        journeyList.append(item);
    });

    if (inserted) {
        const result = document.createElement('li');
        result.className = 'journey-result';
        result.textContent = `找到空位！${value} 就種在這裡。`;
        journeyList.append(result);
    }
}

function plantNumber(value) {
    stopTraversal();
    const result = insertValue(value);
    activeSteps = result.steps;
    lastInserted = result.inserted ? value : null;
    traversalIndex = -1;
    renderTree();
    renderJourney(value, result.steps, result.inserted);

    if (result.inserted) {
        announcement.textContent = result.steps.length === 0
            ? `${value} 成為樹根，樹苗開始長大了！`
            : `${value} 找到位置，成功種下！`;
    } else {
        announcement.textContent = `${value} 已經在樹裡了；這次沒有重複種植。`;
    }
}

insertForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = Number(numberInput.value);
    if (!Number.isInteger(value) || value < -9999 || value > 9999) {
        numberInput.setCustomValidity('請輸入 −9999 到 9999 之間的整數。');
        numberInput.reportValidity();
        numberInput.setCustomValidity('');
        return;
    }

    plantNumber(value);
    numberInput.value = '';
    numberInput.focus();
});

document.getElementById('random-button').addEventListener('click', () => {
    const existingValues = new Set(getInorder(root));
    const availableValues = [];
    for (let value = 1; value <= 99; value += 1) {
        if (!existingValues.has(value)) availableValues.push(value);
    }

    if (availableValues.length === 0) {
        announcement.textContent = '1 到 99 都已經種過了，輸入其他數字繼續吧！';
        numberInput.focus();
        return;
    }

    const value = availableValues[Math.floor(Math.random() * availableValues.length)];
    plantNumber(value);
});

document.getElementById('reset-button').addEventListener('click', () => {
    stopTraversal();
    root = null;
    nodeTotal = 0;
    activeSteps = [];
    lastInserted = null;
    traversalIndex = -1;
    renderTree();
    journeyList.replaceChildren();
    const hint = document.createElement('li');
    hint.className = 'journey-empty';
    hint.textContent = '種下新數字後，這裡會記錄它一路上的比較。';
    journeyList.append(hint);
    announcement.textContent = '空地準備好了，種下第一個數字吧！';
    numberInput.value = '';
    numberInput.focus();
});

document.querySelectorAll('.traversal-tab').forEach((button) => {
    button.addEventListener('click', () => {
        stopTraversal();
        traversalType = button.dataset.traversal;
        traversalIndex = -1;
        renderTree();
    });
});

document.getElementById('traversal-next').addEventListener('click', advanceTraversal);
document.getElementById('traversal-previous').addEventListener('click', () => {
    stopTraversal();
    if (traversalIndex >= getTraversal(root, traversalType).length) {
        traversalIndex = getTraversal(root, traversalType).length - 1;
    } else {
        traversalIndex = Math.max(0, traversalIndex - 1);
    }
    renderTree();
});
playButton.addEventListener('click', () => {
    if (traversalTimer !== null) {
        stopTraversal();
        return;
    }
    if (traversalIndex >= getTraversal(root, traversalType).length) traversalIndex = -1;
    advanceTraversal();
    if (traversalIndex < getTraversal(root, traversalType).length) {
        playButton.textContent = 'Ⅱ 暫停';
        traversalTimer = window.setInterval(advanceTraversal, 750);
    }
});
document.getElementById('traversal-reset').addEventListener('click', () => {
    stopTraversal();
    traversalIndex = -1;
    renderTree();
});

SAMPLE_VALUES.forEach((value) => insertValue(value));
renderTree();
