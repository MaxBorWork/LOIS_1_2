// author Borisevich M.R. 621702
//

let LEFT_BRACKET = "(";
let RIGHT_BRACKET = ")";
let lBracketPattern = new RegExp('\\' + LEFT_BRACKET, 'g');
let rBracketPattern = new RegExp('\\' + RIGHT_BRACKET, 'g');

let KONJUNCTION = "&";
let DISJUNCTION = "|";
let NEGATION = "!";
let IMPICATION = "->";
let EQUIVALENCE = "~";
let operationsRegexp = /~|->|&|\||!/g;

let linesNumber = 0;
let variables = [];
let linesValuesArr = [];
let truthTable = [];
let subformulsArr = [];

function main() {
    let formula = document.getElementById("formula").value.toString();
    if ((formula.includes(LEFT_BRACKET) || formula.includes(RIGHT_BRACKET)) && !checkBracketsNum(formula)) {
        document.getElementById("error").innerHTML = "Проверьте введенную формулу";
        return;
    }
    getVariables(formula);
    console.log(variables);
    document.getElementById("answer").innerHTML = buildSKNF(formula);
}

function buildSKNF(formula) {
    let sknf = "";
    let columnsNumber = variables.length;
    linesNumber = Math.pow(2, columnsNumber);

    buildVariablesColumns();
    buildTruthTable(formula);

    let disjuncts = createDisjuctsByTable();
    let disjunctsNumber = disjuncts.length;

    for (let disjunctIndex = 0; disjunctIndex < disjunctsNumber; disjunctIndex++) {
        if (disjunctIndex > 0 && disjunctIndex !== disjunctsNumber - 1) {
            sknf += KONJUNCTION+ LEFT_BRACKET;
        } else if (disjunctIndex > 0 && disjunctIndex === disjunctsNumber - 1) {
            sknf += KONJUNCTION;
        }
        sknf += disjuncts[disjunctIndex];
    }

    for (let disjunctIndex = 0; disjunctIndex < disjunctsNumber - 2; disjunctIndex++) {
        sknf += RIGHT_BRACKET;
    }

    if (disjunctsNumber > 1) {
        sknf = LEFT_BRACKET + sknf + RIGHT_BRACKET;
    }
    return sknf;
}

//author Novitsky V
function buildVariablesColumns() {
    let columnsNumber = variables.length;
    for (let i = 0; i < linesNumber; i++) {
        let lineValue = {};
        let binary = convertToBinaryWithLength(i, columnsNumber);

        for (let j = 0; j < columnsNumber; j++) {
            lineValue[variables[j]] = Number(binary[j]);
        }

        linesValuesArr.push(lineValue);
    }
}

//author Novitsky V
function convertToBinaryWithLength(number, length) {
    const binRadix = 2;

    let binary = number.toString(binRadix);

    let binaryLength = binary.length;

    if (binaryLength < length) {
        let addingNumber = length - binaryLength;

        for (let i = 0; i < addingNumber; i++) {
            binary = '0' + binary;
        }
    }
    return binary;
}

function getVariables(formula) {
    let atoms = formula.match(/[A-Z]+\d*/g);
    unique(atoms)
}

function unique(arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        obj[str] = true;
    }
    variables = Object.keys(obj);
}

function buildTruthTable(formula) {
    let subformuls = parseSubformuls(formula);
    for (let i = 0; i < linesNumber; i++) {
        if (formula === "1" || formula === "0") {
            truthTable.push(Number(formula));
        } else if (checkSymbols(formula)) {
            truthTable.push(linesValuesArr[formula]);
        } else {
            let currentSubform = subformuls[formula];
            truthTable.push(performOperation(currentSubform, subformuls, linesValuesArr[i]));
        }
    }
    printTruthTable(subformuls);
}

function printTruthTable(subformuls) {
    console.log(truthTable);
    let tbody = document.getElementById("truthTable").getElementsByTagName("TBODY")[0];
    let row = document.createElement("TR");
    for (let varIndex = 0; varIndex < variables.length; varIndex++) {
        let td = document.createElement("TD");
        td.appendChild(document.createTextNode(variables[varIndex]));
        row.appendChild(td);
    }
    for (let key in subformuls) {
        let td = document.createElement("TD");
        td.appendChild(document.createTextNode(key));
        row.appendChild(td);
    }
    tbody.appendChild(row);
    for (let lineIndex = 0; lineIndex < linesNumber; lineIndex++)
    {
        let row = document.createElement("TR");
        for (let variableIndex = 0; variableIndex < variables.length; variableIndex++) {
            let td = document.createElement("TD");
            td.appendChild(document.createTextNode(linesValuesArr[lineIndex][variables[variableIndex]]));
            row.appendChild(td);
        }
        // for (let subIndex = 0; subIndex < subformuls.length; subIndex++) {
        //     let td = document.createElement("TD");
        //     td.appendChild(document.createTextNode(truthTable[i][subformuls[subIndex]]));
        //     row.appendChild(td);
        // }
        for (let key in subformuls) {
            let td = document.createElement("TD");
            td.appendChild(document.createTextNode(truthTable[lineIndex]));
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
}

function parseSubformuls(formula) {
    let subforms = {};
    let found;

    while ((found = operationsRegexp.exec(formula))) {
        let subformuls = {};
        let subformulsKey;

        let operator = found[0];
        let operatorIndex = found.index;

        subformuls["operator"] = operator;

        if (operator === NEGATION) {
            let operand = getSubformCentralOperation(formula, operatorIndex, false);
            subformuls["operand"] = operand;

            subformulsKey = LEFT_BRACKET + operator + operand + RIGHT_BRACKET;
        } else {
            let leftOperand = getSubformCentralOperation(formula, operatorIndex, true);
            subformuls["left"] = leftOperand;

            if (operator === IMPICATION) {
                operatorIndex++;
            }

            let rightOperand = getSubformCentralOperation(formula, operatorIndex, false);
            subformuls["right"] = rightOperand;

            subformulsKey = LEFT_BRACKET + leftOperand + operator + rightOperand + RIGHT_BRACKET;
        }

        subforms[subformulsKey] = subformuls;
    }

    return subforms;
}

function getSubformCentralOperation(formula, operatorIndex, isLeft) {
    let openBracketsNum = 0;
    if (isLeft) {
        let formulaIndex = operatorIndex - 1;
        while (formulaIndex > 0) {
            if (formula[formulaIndex] === LEFT_BRACKET && openBracketsNum === 0) {
                break;
            } else if (formula[formulaIndex] === RIGHT_BRACKET) {
                openBracketsNum++;
            } else if (formula[formulaIndex] === LEFT_BRACKET) {
                openBracketsNum--;
            }
            formulaIndex--;
        }
        return formula.substring(formulaIndex + 1, operatorIndex);
    } else {
        let formulaIndex = operatorIndex + 1;
        while (formulaIndex < formula.length) {
            if (formula[formulaIndex] === LEFT_BRACKET) {
                openBracketsNum++;
            } else if (formula[formulaIndex] === RIGHT_BRACKET && openBracketsNum === 0) {
                break;
            } else if (formula[formulaIndex] === RIGHT_BRACKET) {
                openBracketsNum--;
            }
            formulaIndex++;
        }
        return formula.substring(operatorIndex + 1, formulaIndex);
    }
}

function checkSymbols(formula) {
    let symbols = /^[A-Z]+\d*$/;
    return symbols.test(formula)
}

function performOperation(subform, subforms, lineValue) {
    let result;

    switch (subform.operator) {
        case NEGATION:
            result = negation(calculateSubformula(subform.operand, subforms, lineValue));
            break;
        case DISJUNCTION:
            result = calculateSubformula(subform["left"], subforms, lineValue)
                | calculateSubformula(subform["right"], subforms, lineValue);
            break;
        case KONJUNCTION:
            result = calculateSubformula(subform["left"], subforms, lineValue)
                & calculateSubformula(subform["right"], subforms, lineValue);
            break;
        case EQUIVALENCE:
            result = equivalence(calculateSubformula(subform["left"], subforms, lineValue),
                calculateSubformula(subform["right"], subforms, lineValue));
            break;
        case IMPICATION:
            result = implication(calculateSubformula(subform["left"], subforms, lineValue),
                calculateSubformula(subform["right"], subforms, lineValue));
            break;
    }
    return result;
}

function negation(operand) {
    if (operand === 1) {
        return 0;
    } else {
        return 1;
    }
}

function equivalence(leftOperand, rightOperand) {
    if (leftOperand === rightOperand) {
        return 1;
    } else {
        return 0;
    }
}

function implication(leftOperand, rightOperand) {
    return negation(leftOperand) | rightOperand;
}

function calculateSubformula(subform, subforms, lineValue) {
    let result;

    if (subform === "1" || subform === "0") {
        result = Number(subform);
    } else if (checkSymbols(subform)) {
        result = lineValue[subform];
    } else {
        result = performOperation(subforms[subform], subforms, lineValue)
    }
    subformulsArr[subform] = result;
    return result;
}

function checkBracketsNum(formula) {
    if (formula.includes(LEFT_BRACKET) && formula.includes(RIGHT_BRACKET)) {
        let leftBracketsArr = formula.match(lBracketPattern);
        let rightBracketsArr = formula.match(rBracketPattern);
        if (leftBracketsArr.length !== rightBracketsArr.length) {
            return false;
        }
    } else if (formula.includes(LEFT_BRACKET) && !formula.includes(RIGHT_BRACKET)) {
        return false;
    } else if (formula.includes(RIGHT_BRACKET) && !formula.includes(LEFT_BRACKET)) {
        return false;
    }
    return true;
}

function createDisjuctsByTable() {
    let disjuncts = [];

    for (let lineIndex = 0; lineIndex < linesNumber; lineIndex++) {
        if (truthTable[lineIndex] === 0) {
            let disjunct = "";

            let keys = Object.keys(linesValuesArr[lineIndex]);
            let keysNumber = keys.length;

            for (let keyIndex = 0; keyIndex < keysNumber; keyIndex++) {
                let key = keys[keyIndex];

                if (keyIndex > 0 && keyIndex !== keysNumber - 1) {
                    disjunct += DISJUNCTION + LEFT_BRACKET;
                } else if (keyIndex > 0 && keyIndex === keysNumber - 1) {
                    disjunct += DISJUNCTION;
                }

                if (linesValuesArr[lineIndex][key] === 0) {
                    disjunct += key;
                } else {
                    disjunct += LEFT_BRACKET + NEGATION + key + RIGHT_BRACKET;
                }
            }

            for (let i = 0; i < keysNumber - 2; i++) {
                disjunct += RIGHT_BRACKET;
            }

            if (keysNumber > 1) {
                disjunct = LEFT_BRACKET + disjunct + RIGHT_BRACKET;
            }
            disjuncts.push(disjunct);
        }
    }

    return disjuncts;
}