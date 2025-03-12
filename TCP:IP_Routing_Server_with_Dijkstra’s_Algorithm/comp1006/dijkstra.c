/*
 *  dijkstra.c
 *  ProgrammingPortfolio
 *
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <float.h>
#include "graph.h"
#include "dijkstra.h"


/* find shortest paths between source node id and all other nodes in graph. */
/* upon success, returns an array containing a table of shortest paths.  */
/* return NULL if *graph is uninitialised or an error occurs. */
/* each entry of the table array should be a Path */
/* structure containing the path information for the shortest path between */
/* the source node and every node in the graph. If no path exists to a */
/* particular desination node, then next should be set to -1 and weight */
/* to DBL_MAX in the Path structure for this node */
Path *dijkstra(Graph *graph, int id, int *pnEntries)
{
    int * vertices, * visited,count,i, j,minId, * next_hop;
    double * weight;
    Vertex * v;
    double minWeight;
    Path *table = NULL;
    Edge *  edge = NULL;

    *pnEntries=1;

    if(!graph)
    return NULL;

    v = find_vertex(graph,id);

    if(!v)
    return NULL;

    vertices = get_vertices(graph, &count);
    *pnEntries = count+1;

    visited=(int *)malloc(sizeof(int) * (count + 1));
    for(j=0;j<=count;j++){
        visited[j]=0;
    }

    next_hop=(int *)malloc(sizeof(int) * (count + 1));
    for(j=0;j<=count;j++){
        next_hop[j]=0;
    }

    weight=(double *)malloc(sizeof(double) * (count + 1));
        for(j=0;j<=count;j++){
            weight[j]=DBL_MAX;
        }

    visited[id]=1;
    minId=-1;
    minWeight=DBL_MAX;

        for(i=0;i<count;i++){
            edge = get_edge(graph, id,vertices[i]);
            if(edge){
                next_hop[vertices[i]] = vertices[i];
                weight[vertices[i]] = edge_weight(edge);
                if((weight[vertices[i]]<  minWeight) && (visited[vertices[i]]==0)){
                    minWeight=weight[vertices[i]];
                    minId = vertices[i];
                }
            }
        }
        next_hop[id] = -1;
        weight[id] = DBL_MAX;



    while (minId!=-1){
        visited[minId]=1;
        for(j=0;j<count;j++){
            if(visited[vertices[j]]==0){
                edge = get_edge(graph, minId, vertices[j]);
                if(edge && weight[vertices[j]] > weight[minId] + edge_weight(edge)){
                    next_hop[vertices[j]] = next_hop[minId];
                    weight[vertices[j]] =  weight[minId] + edge_weight(edge);
                }
            }
        }
        minWeight=DBL_MAX;
        minId = -1;
        for(i=0;i<count;i++){
            if( (weight[vertices[i]]<  minWeight) && visited[vertices[i]]==0){
                minWeight=weight[vertices[i]];
                minId = vertices[i];
            }
        }
    }
    table = (Path *)malloc(sizeof(Path) * (count + 1));

    for(i = 0; i < count; i++){
            Path p;
            p.next_hop=next_hop[vertices[i]];
            p.weight=weight[vertices[i]];
            if(weight[vertices[i]]==DBL_MAX)
            p.next_hop=-1;
            *(table+vertices[i])=p;
        }
        free(visited);
        free(vertices);
        free(next_hop);
        free(weight);

        return table;
    }
