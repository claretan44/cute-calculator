/* TODO FOR FUTURE ME:
implement the back button: aside from removing text, it should update the input error variables */

/* The following global object is for storing the calculator state */
const calculator = 
{
    /* screenBlank is for if a person types an operator before any digits have been added 
       resultOnScreen is used to make sure a displayed result gets wiped before a new number is added
       operatorEntered is used to prevent two operators being added one after the other 
       negativeNumber allows operatorEntered to be overridden once
       errorOnScreen is for when a user tries to divide by zero
       screenText is what is displayed on the screen
    */
    screenBlank: true,
    resultOnScreen: false,
    operatorEntered: false,
    negativeNumber: false,
    errorOnScreen: false,
    screenText: '',
    operators: ['+','-','x','/'],
    digitsToNumber: function(digitArray)
    {
        /* This helper function converts individual digits into one number */
        /*TODO HUHU CHECK IF THERE ARE DECIMAL POINTS */
        
        let len = digitArray.length;
        let num = 0;
        let negative = false;
        const hasDecimal = digitArray.includes('.');
        let decimalDivision = 1;
        if (hasDecimal)
        {
            const decimalPointIndex = digitArray.indexOf('.');
            decimalDivision = 10**(digitArray.length -1 - decimalPointIndex);
            /* once the location has been saved, remove the decimal point */
            digitArray.splice(decimalPointIndex,1);
            len -= 1;
        }
        /* iterate over the digits from last digit (ones place) to first digit or until a decimal point */
        for (let i = (len - 1), j = 0; i >= 0; i--, j++){
            if(digitArray[i] === '-')
            {
                negative = true;
            }
            else
            {
                num += (digitArray[i]*(10**j));
            }
        }
        num /= decimalDivision;
        if (negative)
        {
            num *= -1;
        }
        return num;
    },
    getResult: function(operands, calculations)
    {
        /* this function is called by calculate, it processes two lists with what have to be done */
        if(operands.length > 0){
            let res = operands[0];
            for(let i=0, j = 1; i<calculations.length; i++, j++)
            {
                switch(calculations[i])
                {
                    case '+':
                        res += operands[j];
                        break;
                    case '-':
                        res -= operands[j];
                        break;
                    case 'x':
                        res *= operands[j];
                        break;
                    case '/':
                        if(res === 0 && operands[j] === 0)
                        {
                            this.errorOnScreen = true;
                            return 'Error';
                        }
                        else if(operands[j] === 0)
                        {
                            this.errorOnScreen = true;
                            if (res>0) 
                            {
                                return 'Infinity';
                            }
                            else
                            {
                                return '-Infinity';
                            }
                        }
                        else
                        {
                            res /= operands[j];
                            const origString = res.toString();
                            if (origString.length > 11)
                            {
                                return res.toFixed(11);
                            }   
                            return origString;
                        }
                        break;
                }
            }
            return res.toString();
        }
        else {
            return '0';
        }
    },
    calculate: function()
    {
        /*This function processes the operations to be done based on what is stored in screenText */
        let digits = [];
        let calculations = [];
        let operands = [];
        /* first iterate through all the characters */
        for (const chr of this.screenText){
            if(['0','1','2','3','4','5','6','7','8','9'].includes(chr)){
                digits.push(Number(chr));
            }
            else if (chr === '.')
            {
                digits.push('.');
            }
            else if (chr === '-'){
                /*check for negative number */
                if (digits.length > 0)
                {
                    /* a subtraction operand, not a negative number */
                    operands.push(this.digitsToNumber(digits));
                    digits = [];
                    calculations.push(chr);
                }
                else{
                    digits.push(chr);
                }
            }
            else if (this.operators.includes(chr)){
                operands.push(this.digitsToNumber(digits));
                digits = [];
                calculations.push(chr);
            }
        }
        /* the digits after the last operation will not be processed yet */
        operands.push(this.digitsToNumber(digits));
        digits = [];

        const result = this.getResult(operands, calculations);
        return result;
    },
};

/* The following helper functions are for checking what type of calculator button was pressed */
function isDigit(buttonText){
    return /^\d$/.test(buttonText);
}

function isOperator(buttonText){
    const operators = calculator.operators;
    return operators.includes(buttonText);
}

/* This function is for updating the screen to reflect what the user typed */
function updateDisplay(display){
    display.textContent = calculator.screenText;
}
/* The following is the code to add event listeners, 
all wrapped up in a function that executes when the page has loaded */
document.addEventListener('DOMContentLoaded', function() {
    const buttonContainer = document.querySelector('.calculator-wrapper');

    const resultScreen = document.querySelector('.result-text');

    buttonContainer.addEventListener('click', function(event) {
        if(event.target.tagName === 'BUTTON'){
            const buttonText = event.target.textContent;

            /* code for c button */
            if (buttonText.toLowerCase() === 'c')
            {
                calculator.screenText = '';
                calculator.resultOnScreen = false;
                calculator.operatorEntered = false;
                calculator.screenBlank = true;
                calculator.errorOnScreen = false;
                calculator.negativeNumber = false;
            }
            else if (buttonText === '<-')
            {
                /*TODO: implement this! Also check for error on screen!
                    check the operatorEntered status, set to false
                    check if the screen will become blank
                */
               if (!calculator.screenBlank){
                    /*don't do anything if there's nothing to erase */
                    if (calculator.resultOnScreen){
                        /*clear completely when the answer or an error is being displayed */
                        if(calculator.errorOnScreen)
                        {
                            calculator.errorOnScreen = false;
                        }
                        calculator.resultOnScreen = false;
                        calculator.screenText = '';
                        calculator.screenBlank = true;
                    }
                    else{
                        /* check for digits or operators that were entered, and lastly check if the screen becomes blank */
                        if(calculator.operatorEntered)
                        {
                            /*handle it if a negative number is being waited for */
                            if(calculator.negativeNumber)
                            {
                                calculator.negativeNumber = false;
                                calculator.screenText = calculator.screenText.slice(0,-1);
                                /* don't set operator entered to false automatically */
                                const lastChar = calculator.screenText[(calculator.screenText.length - 1)];
                                if (!calculator.operators.includes(lastChar))
                                {
                                    calculator.operatorEntered = false;
                                }
                            }
                            else
                            {
                                calculator.operatorEntered = false;
                                calculator.screenText = calculator.screenText.slice(0,-1);
                            }
                        }
                        else
                        {
                            /*this assumes deleting a digit, 
                            when doing this check if a negative number is being deleted */

                            calculator.screenText = calculator.screenText.slice(0,-1);
                            if(calculator.screenText.length > 0)
                            {
                                /* check for the operatorentered variable */
                                const lastChar = calculator.screenText[(calculator.screenText.length - 1)];
                                if(calculator.operators.includes(lastChar))
                                {
                                    calculator.operatorEntered = true;
                                }
                                /*check for a waiting negative number */
                                if(calculator.screenText.length > 2)
                                {
                                    const secondToLastChar = calculator.screenText[(calculator.screenText.length - 2)];
                                    if(lastChar === '-' && ['x','/'].includes(secondToLastChar))
                                    {
                                        calculator.negativeNumber = true;
                                    }
                                }
                            }
                            
                        }
                        if (calculator.screenText.length === 0)
                        {
                            calculator.screenBlank = true;
                        }
                    }
               }
               
            }
            else if (isDigit(buttonText))
            {
                if (calculator.negativeNumber)
                {
                    /* calculator waiting for negative number input and it has been received */
                    calculator.negativeNumber = false;
                }
                if(calculator.resultOnScreen || calculator.errorOnScreen)
                {
                    /* Don't add digits to a previous number */
                    calculator.screenText = '';
                    calculator.resultOnScreen = false;
                    calculator.errorOnScreen = false;
                }
                calculator.operatorEntered = false;
                calculator.screenText += buttonText;
                calculator.screenBlank = false;
            }
            else if (isOperator(buttonText))
            {
                if (calculator.screenBlank)
                {
                    calculator.screenText = '0';
                    calculator.screenBlank = false;
                    calculator.screenText += buttonText;
                }
                else if (calculator.resultOnScreen) 
                {
                    /* allow adding an operator to a result */
                    if (calculator.errorOnScreen)
                    {
                        /*for errors, set the screen to zero first */
                        calculator.screenText = '0';
                        calculator.errorOnScreen = false;
                    }
                    calculator.resultOnScreen = false;
                    calculator.screenText += buttonText;
                }
                else if (calculator.operatorEntered)
                {
                    /* handle it if a previous operator has already been added */
                    if(!calculator.negativeNumber)
                    {
                        /*if the calculator is waiting for a negative number to be entered, 
                         it must be finished, only allow input if this is not the case
                        eg: 7*- */
                        if(buttonText === "-")
                        {
                            /*allow a previous operator for adding negative numbers */
                            let lastCharIndex = calculator.screenText.length - 1;
                            const lastOperator = calculator.screenText[lastCharIndex];
                            switch (lastOperator) {
                                case '+':
                                    calculator.screenText = calculator.screenText.slice(0, -1);
                                    calculator.screenText += buttonText;
                                    break;
                                case '-':
                                    calculator.screenText = calculator.screenText.slice(0, -1);
                                    calculator.screenText += '+';
                                    break;
                                case 'x':
                                    calculator.negativeNumber = true;
                                    calculator.screenText += buttonText;
                                    break;
                                case '/':
                                    calculator.negativeNumber = true;
                                    calculator.screenText += buttonText;
                                    break;
                            }
                        }
                        else
                        {
                            /* if there are no negatives involved, just remove the old operator */
                            calculator.screenText = calculator.screenText.slice(0, -1);
                            calculator.screenText += buttonText;
                        }
                    }
                }
                else
                {
                    calculator.screenText += buttonText;
                }
                calculator.operatorEntered = true;
            }
            else if(buttonText === '=')
            {
                /*only let it work if an operator was NOT the last input */
                if (!calculator.operatorEntered){
                    calculator.screenText = calculator.calculate();
                    calculator.resultOnScreen = true;
                    calculator.screenBlank = false;
                }
            }
            /*Always update the screen after a click */
            updateDisplay(resultScreen);
        }
    });
});
