#include "rpn.h"
#include "stack.h"
#include "queue.h"
#include <ctype.h>
#include <stdio.h>

int is_left_associative(char);
int is_operator(char);
int operator_precedence(char);
int test_precedence(int, int);
int is_number(char);

/* convert an infix expression to postfix (rpn) using the */
/* shunting yard algorithm. */
/* return a queue containing the postfix expression. */
/* if an error occurs during evaluation, return silently with NULL. */
Queue *infix_to_postfix(char *expr)
{
	int n;
	Stack *stack1 = initialise_stack();
	Queue *queue1 = initialise_queue();

	for (n = 0; expr[n] != '\0'; n++) {
		if ((expr[n] != '+') && (expr[n] != '-') && (expr[n] != '*') && (expr[n] != '/') && (expr[n] != '^'))
		{
			if(expr[n] == '(')
			{
				push_queue(queue1, (void *) &expr[n], 10);
			}else if(expr[n] == ')')
			{
				pop_stack(queue1);
			}else if((expr[n] == '+') && (expr[n] == '-') && (expr[n] == '*') && (expr[n] == '/') && (expr[n] == '^'))
			{
				if(test_precedence(operator_precedence(expr[n]), operator_precedence((int)stack1->head)) >= 0)
				{
					pop_stack(queue1);
				}else if((test_precedence(operator_precedence(expr[n]), operator_precedence((int)stack1->head)) < 0) || (expr[n] == '('))
				{
					push_queue(queue1, (void *) &expr[n], 10);
				}
			}else
			{
				printf("%c\n", expr[n]);
			}
		}
    }

    pop_stack(queue1);

    free_stack(stack1);
	free_queue(queue1);

	return 0;
}

int is_left_associative(char leftoperator)
{
	if(leftoperator == '^')
	{
		return 0;
	}else
	{
		return 1;
	}
}

int is_operator(char operator)
{
	if((operator != '+') && (operator != '-') && (operator != '*') && (operator != '/') && (operator != '^'))
	{
		return 1;
	}else
	{
		return 0;
	}
}

int operator_precedence(char operator)
{
	int precedence;

	if((operator = '+') || (operator = '-'))
	{
		precedence=1;

	}else if((operator = '*') || (operator = '/'))
	{
		precedence = 2;
	}else if((operator = '^'))
	{
		precedence = 3;
	}else
	{
		exit(EXIT_FAILURE);
	}
	return precedence;
}

int test_precedence(int precedence1, int precedence2)
{
	if(precedence1 < precedence2)
	{
		return -1;
	}else if(precedence1 == precedence2)
	{
		return 0;
	}else
	{
		return 1;
	}
}
int is_number(char character)
{
	if(isalpha(character))
	{
		return 0;
	}else
	{
		return 1;
	}
}



/* evaluate the rpn expression given in *queue. */
/* return the value of the evaluated expression. */
/* if an error occurs during evaluation, return silently with HUGE_VAL. */
/* assume a precision of eight decimal places when performing arithmetic. */
double evaluate_rpn(Queue *queue)
{
	/* this is just a placeholder return */
	/* you will need to replace it */
	return 0.0;
}
