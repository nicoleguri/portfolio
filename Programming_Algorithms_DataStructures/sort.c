#include "sort.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
/* sort linked list *list using merge insertion sort. */
/* upon success, the elements in *list will be sorted. */
/* return silently if *list is uninitialised or empty. */
/* the compare argument is a pointer to a function which returns */
/* less than 0, 0, or greater than 0 if first argument is */
/* less than, equal to, or greater than second argument respectively. */

void insertion_sort(LinkedList *list, int (*compare)(void *, void *))
{
LinkedList *sortedlist;
Node *nodeB;
Node *insertN;

    sortedlist = initialise_linked_list();
    append_linked_list(sortedlist, list->head->data);
    remove_head_linked_list(list);
    /*removes the first word*/
    while (list->head != NULL)
    {

        nodeB = sortedlist->head;

        while(nodeB!=NULL)
        {

            if((compare(list->head->data, nodeB->data))<0)
            {

                if(!nodeB->prev)
                {

                    prepend_linked_list(sortedlist, list->head->data);
                    remove_head_linked_list(list);

                }else
                {

                    insertN = initialise_node();
                    insertN->data = list->head->data;
                    insertN->prev = nodeB->prev;
                    insertN->next = nodeB;
                    nodeB->prev->next = insertN;
                    nodeB->prev = insertN;

                    remove_head_linked_list(list);
                }break;
            }
            nodeB = nodeB->next;
        }
        if(!nodeB)
        {

            append_linked_list(sortedlist,list->head->data);
            remove_head_linked_list(list);
        }

    }
    print_linked_list(sortedlist, print_string);
    free_linked_list(sortedlist);


}


/* sort linked list *list using merge sort algorithm. */
/* upon success, the elements in *list will be sorted. */
/* return silently if *list is uninitialised or empty. */
/* the compare argument is a pointer to a function which returns */
/* less than 0, 0, or greater than 0 if first argument is */
/* less than, equal to, or greater than second argument respectively. */



void merge_sort(LinkedList *list, int (*compare)(void *, void *))
{
   LinkedList *sortedlist;
Node *nodeB;
Node *insertN;

    sortedlist = initialise_linked_list();
    append_linked_list(sortedlist, list->head->data);
    remove_head_linked_list(list);
    /*removes the first word*/
    while (list->head != NULL)
    {

        nodeB = sortedlist->head;

        while(nodeB!=NULL)
        {

            if((compare(list->head->data, nodeB->data))<0)
            {

                if(!nodeB->prev)
                {

                    prepend_linked_list(sortedlist, list->head->data);
                    remove_head_linked_list(list);

                }else
                {

                    insertN = initialise_node();
                    insertN->data = list->head->data;
                    insertN->prev = nodeB->prev;
                    insertN->next = nodeB;
                    nodeB->prev->next = insertN;
                    nodeB->prev = insertN;

                    remove_head_linked_list(list);
                }break;
            }
            nodeB = nodeB->next;
        }
        if(!nodeB)
        {

            append_linked_list(sortedlist,list->head->data);
            remove_head_linked_list(list);
        }

    }
    print_linked_list(sortedlist, print_string);
    free_linked_list(sortedlist);


}







