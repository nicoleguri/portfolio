#include "graph.h"
#include <stdio.h>
#include <stdlib.h>

/* initialise an empty graph */
/* return pointer to initialised graph */
Graph *init_graph(void)
{
    Graph *graph;

    graph = (Graph *)  initialise_linked_list();

    return graph;


}

/* release memory for graph */
void free_graph(Graph *graph)
{
    Node * tmp;

    if(!graph){
        fprintf(stderr, "warning: unable to free graph\n");
        return;
    }

    tmp = graph->head;
    while (tmp) {
        free_vertex((Vertex *)tmp->data);
        tmp = tmp->next;

    }
    free_linked_list(graph);
}

/* initialise a vertex */
/* return pointer to initialised vertex */
Vertex *init_vertex(int id)
{
    Vertex * ver=(Vertex *)malloc(sizeof(Vertex));
    ver->id=id;
    ver->edges = initialise_linked_list();
    return ver;
}

/* release memory for initialised vertex */
void free_vertex(Vertex *vertex)
{
    Node * tmp2;

    if(!vertex){
        fprintf(stderr, "warning: unable to free vertex\n");

        return;
    }
     tmp2=vertex->edges->head;
    while (tmp2) {
        free(tmp2->data);
        remove_head_linked_list(vertex->edges);
        tmp2 = vertex->edges->head;
    }

    free_linked_list(vertex->edges);
    free(vertex);
}

/* initialise an edge. */
/* return pointer to initialised edge. */
Edge *init_edge(void)
{
    Edge * ed=(Edge *)malloc(sizeof(Edge));
    ed->weight=0;
    ed->vertex = NULL;
    return ed;
}

/* release memory for initialised edge. */
void free_edge(Edge *edge)
{
    if(!edge)
        {
        fprintf(stderr, "warning: unable to free edge\n");

        return;
    }
    free(edge);
}

/* remove all edges from vertex with id from to vertex with id to from graph. */
void remove_edge(Graph *graph, int from, int to)
{
    Node * tmp2;
    Vertex * vert;
    if(!graph){
       fprintf(stderr, "warning: unable to remove edge\n");
       return;
    }
    vert = find_vertex(graph,from);
    if(!vert)
        return;
    if(!vert->edges)
        return;

    tmp2=vert->edges->head;
    while(tmp2 && ((Edge *)tmp2->data)->vertex->id!=to) {
        tmp2 = tmp2->next;
    }
    if(tmp2){
        free(tmp2->data);
        if(!tmp2->prev)
            remove_head_linked_list(vert->edges);
        else if(!tmp2->next)
            remove_tail_linked_list(vert->edges);
        else{
                    tmp2->prev->next=tmp2->next;
                    tmp2->next->prev=tmp2->prev;

                    free(tmp2);
            }

    }
}

/* remove all edges from vertex with specified id. */
void remove_edges(Graph *graph, int id)
{
    Vertex * vert;
    Node * tmp2;

    if(!graph){
       fprintf(stderr, "warning: unable to remove edge\n");
       return;
    }
    vert = find_vertex(graph,id);
    if(!vert)
        return;
    tmp2=vert->edges->head;
    while (tmp2) {
        free(tmp2->data);
        remove_head_linked_list(vert->edges);
        tmp2 = vert->edges->head;
    }
}

/* output all vertices and edges in graph. */
/* each vertex in the graphs should be printed on a new line */
/* each vertex should be printed in the following format: */
/* vertex_id: edge_to_vertex[weight] edge_to_vertex[weight] ... */
/* for example: */
/* 1: 3[1.00] 5[2.00] */
/* indicating that vertex id 1 has edges to vertices 3 and 5 */
/* with weights 1.00 and 2.00 respectively */
/* weights should be output to two decimal places */
void print_graph(Graph *graph)
{
    Node * tmp;
    Node * tmp2;
    if(!graph){
       fprintf(stderr, "warning: unable to print graph\n");
       return;
    }
    tmp = graph->head;
    while(tmp) {
		printf("%d:",((Vertex *)tmp->data)->id);
        if(!((Vertex *)tmp->data)->edges){
            printf("\n");
            break;
        }

        tmp2=((Vertex *)tmp->data)->edges->head;
        while(tmp2) {
            printf(" %d[%.2f]",((Edge *)tmp2->data)->vertex->id,((Edge *)tmp2->data)->weight);
            tmp2 = tmp2->next;
        }
        printf("\n");
		tmp = tmp->next;
	}
}

/* find vertex with specified id in graph. */
/* return pointer to vertex, or NULL if no vertex found. */
Vertex *find_vertex(Graph *graph, int id)
{
    Node * tmp;

    if(!graph){
       fprintf(stderr, "warning: unable to find vertex\n");
       return NULL;
    }
    tmp = graph->head;

    while(tmp) {
		if(((Vertex *)tmp->data)->id == id){
            return (Vertex *)tmp->data;
        }
		tmp = tmp->next;
	}
    return NULL;

}

/* create and add vertex with specified id to graph. */
/* return pointer to vertex or NULL if an error occurs. */
/* if vertex with id already exists, return pointer to existing vertex. */
Vertex *add_vertex(Graph *graph, int id)
{
    Vertex * ver;
    /* Check if a Null reference is passed */
    if(!graph){
       fprintf(stderr, "warning: unable to add vertex\n");
       return NULL;
    }
    /* Add a vertex only when not previously created*/
    if (!find_vertex(graph,id)) {
    ver = init_vertex(id);
    append_linked_list(graph, ver);
    }
    return ver;
}

/* remove vertex with specified id from graph. */
/* remove all edges between specified vertex and any other vertices in graph. */
void remove_vertex(Graph *graph, int id)
{
    Node * tmp, *vert ;
    if(!graph){
       fprintf(stderr, "warning: unable to remove vertex\n");
       return;
    }
    tmp = graph->head;
    /* Check why is this loop necesary */
    while(tmp) {
        if(((Vertex *)tmp->data)->id!=id){
            remove_edge(graph, ((Vertex *)tmp->data)->id, id);
        }
		tmp = tmp->next;
	}
	tmp = graph->head;
    while(tmp) {
        if(((Vertex *)tmp->data)->id==id){
            remove_edges(graph,((Vertex *)tmp->data)->id);
            vert = tmp;
            free_vertex((Vertex *)tmp->data);
            if(!tmp->prev){
                remove_head_linked_list(graph);
            }
            else if(!tmp->next){
                remove_tail_linked_list(graph);
            }
            else{
                        tmp=tmp->prev;
                        vert->prev->next=vert->next;
                        vert->next->prev=vert->prev;
                        free(vert);
                }
            return;
        }
		tmp = tmp->next;
	}

    return;
}

/* add directed edge with specified weight between vertex with id from */
/* to vertex with id to. */
/* if no vertices with specified ids (from or to) exist */
/* then the vertices will be created. */
/* multiple edges between the same pair of vertices are allowed. */
/* return pointer to edge, or NULL if an error occurs found. */
Edge *add_edge(Graph *graph, int from, int to, double weight)
{
    Vertex * verFrom;
    Vertex * verTo;
    Edge * ed;
    if(!graph){
       fprintf(stderr, "warning: unable to add edge\n");
       return NULL;
    }

    verFrom = find_vertex(graph,from);
    verTo = find_vertex(graph,to);
    if(!verFrom){
        verFrom = add_vertex(graph,from);
    }
    if(!verTo){
        verTo = add_vertex(graph,to);
    }

    ed = init_edge();
    ed->weight = weight;
    ed->vertex = verTo;
    append_linked_list(verFrom->edges, ed);
    return ed;
}

/* add two edges to graph, one from vertex with id from to vertex with id to, */
/* and one from vertex with id to to vertex with id from. */
/* both edges should have the same weight */
/* if no vertices with specified ids (from or to) exist */
/* then the vertices will be created. */
/* multiple vertices between the same pair of vertices are allowed. */
void add_edge_undirected(Graph *graph, int from, int to, double weight)
{
    if(!graph){
       fprintf(stderr,"warning: unable to add undirected edge\n");
       return;
    }
    add_edge(graph, from, to, weight);
    add_edge(graph, to, from, weight);
}

/* return array of node ids in graph. */
/* array of node ids should be dynamically allocated */
/* set count to be the number of nodes in graph */
/* return NULL if no vertices in graph */
int *get_vertices(Graph *graph, int *count)
{
    int * v;
    Node * tmp = graph->head;
    int no = 0;
    int i=0;
    while(tmp) {
		no++;
		tmp = tmp->next;
	}
    if(no==0){
      *count= 0;
      return NULL;
    }

    v = (int *)malloc(sizeof(int*)*no);
    tmp = graph->head;
    while(tmp) {
		v[i] = ((Vertex *)tmp->data)->id;
		tmp = tmp->next;
        i++;
	}
    *count= no;
    return v;
}

/* return array of pointers to edges for a given vertex. */
/* array of edges should be dynamically allocated */
/* set count to be number of edges of vertex */
/* return NULL if no edges from/to vertex */
Edge **get_edges(Graph *graph, Vertex *vertex, int *count)
{
    Edge ** e;
    int no = 0;
    int i = 0;
    Node * tmp = graph->head;
    Node * tmp2;

    if (!graph && !vertex) {
        *count = 0;
        return NULL;
    }
    while(tmp) {
        if(((Vertex *)tmp->data)->id==vertex->id){
            break;
        }
        tmp = tmp->next;
        }

    tmp2=((Vertex *)tmp->data)->edges->head;
    while(tmp2) {
        no++;
        tmp2 = tmp2->next;
    }

    if(no==0){
        *count=0;
        return NULL;
    }

    e = (Edge **)malloc(sizeof(Edge *)*no);

    tmp2=((Vertex *)tmp->data)->edges->head;
    while(tmp2) {
            e[i]=(Edge *)tmp2->data;
            i++;
            tmp2 = tmp2->next;
    }
	*count=no;
	return e;


}

/* return pointer to edge from vertex with id from, to vertex with id to. */
/* return NULL if no edge */
Edge *get_edge(Graph *graph, int from, int to)
{
    Vertex * ver = find_vertex(graph,from);
    Node * tmp2;
    if(!ver){
        return NULL;
    }

    if(!ver->edges){
       return NULL;
    }

    tmp2=ver->edges->head;
    while(tmp2) {
        if(((Edge *)tmp2->data)->vertex->id==to){
                return ((Edge *)tmp2->data);
        }
        tmp2 = tmp2->next;
    }
    return NULL;
}

/* return id of destination node of edge. */
int edge_destination(Edge *edge)
{
    return edge->vertex->id;
}

/* return weight of edge. */
double edge_weight(Edge *edge)
{
    return edge->weight;
}

