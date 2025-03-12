#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <netdb.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sys/socket.h>
#include <float.h>
#include <limits.h>
#include <ctype.h>

#include "graph.h"
#include "dijkstra.h"


#define kBufSize 12


#define kNUMCLUES 5


void ServerConnection(int sd);
void ReadLineFromNetwork(int sd, char *buf, int size);

static Graph *graph;


int main(int argc, const char * argv[])
{
	struct sockaddr_in sad;
	int client_sockfd, sd;
	char *token;

	graph = init_graph();

	sd = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);
	if(sd == -1)
	{
		fprintf(stderr, "Can't create socket\n");
		exit(1);
	}

/* Set up the address of the server */
	memset(&sad, 0, sizeof(sad));
	sad.sin_family = AF_INET;
	/*sad.sin_addr.s_addr = INADDR_ANY;*/
	sad.sin_port = htons(atoi(argv[1]));

	if (bind(sd, (struct sockaddr*)&sad, sizeof(sad)) < 0) {
		printf("bindig() failed");
		exit(1);
	}

	if (listen(sd, 5) < 0) {
		printf("listening() failed");
		exit(1);
	}


	printf("Programming Portfolio 2022 Implementation\n");
	printf("=========================================\n\n");

	while(1)
	{
		socklen_t client_addr_len = sizeof(client_addr_len);
		client_sockfd = accept(sd, (struct sockaddr*) &client_addr_len, &client_addr_len);
		if (client_sockfd < 0) {
		printf("Connection not accepted");
		continue;
		}

		/* Communicate with the client */
		ServerConnection(client_sockfd);

		/* Close connection with the client*/
		printf("Connecction closed\n");
		close(client_sockfd);

	}
	close(sd);
	return 0;
}

void ServerConnection(int sd)
{
	char outBuffer[512];
	char inBuffer[512];
	int * vertices, count, i;


	sprintf(outBuffer, "+OK 2022 Programming Portfolio Route Server\r\n");
	write(sd, outBuffer, strlen(outBuffer));

	while(1)
	{
		char * cmd;
		int arg1=0,arg2=0,arg3=0;
		ReadLineFromNetwork(sd, inBuffer, 512);
		inBuffer[strcspn(inBuffer, "\n\r")] = '\0';
		cmd = strtok(inBuffer, " ");

		cmd = strtok(NULL, " ");
		if(cmd){
			arg1 = atoi(cmd);
		}
		cmd = strtok(NULL, " ");
		if(cmd){
			arg2 = atoi(cmd);
		}
		cmd = strtok(NULL, " ");
		if(cmd){
			arg3 = atoi(cmd);
		}


		if(0 == strcasecmp(inBuffer, "QUIT"))
		{
			sprintf(outBuffer, "+OK\r\n");
			write(sd, outBuffer, strlen(outBuffer));
			return;
		}

		else if(0 == strcasecmp(inBuffer, "NET-ADD"))
		{
			Vertex * vert = find_vertex(graph, arg1);
			if(!vert){
				add_vertex(graph, arg1);
				sprintf(outBuffer, "+OK 1\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
			else{
				sprintf(outBuffer, "-ERR 1\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
		}

		else if(0 == strcasecmp(inBuffer, "NET-DELETE"))
		{
			Vertex * vert = find_vertex(graph, arg1);
			if(vert){
				remove_vertex(graph, arg1);
				sprintf(outBuffer, "+OK\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
			else{
				sprintf(outBuffer, "-ERR\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
		}

		else if(0 == strcasecmp(inBuffer, "NET-LIST"))
		{
			vertices = get_vertices(graph, &count);

			sprintf(outBuffer, "+OK %d\r\n", count);
			write(sd, outBuffer, strlen(outBuffer));
			for(i=0;i<count;i++){
				sprintf(outBuffer, "%d\r\n", vertices[i]);
				write(sd, outBuffer, strlen(outBuffer));
			}
		}
		else if(0 == strcasecmp(inBuffer, "ROUTE-ADD"))
		{
			Vertex * vert1 = find_vertex(graph, arg1);
			Vertex * vert2 = find_vertex(graph, arg2);
			if(!vert1 || !vert2){
				sprintf(outBuffer, "-ERR 1\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
			else{
				Edge * ed = get_edge(graph, arg1,arg2);
				if(!ed){
					add_edge_undirected(graph, arg1, arg2, arg3);
					sprintf(outBuffer, "+OK\r\n");
					write(sd, outBuffer, strlen(outBuffer));
				}
				else {
					ed->weight = arg3;
				}
			}
		}
		else if(0 == strcasecmp(inBuffer, "ROUTE-DELETE"))
		{
			Edge * ed = get_edge(graph, arg1,arg2);
			if(ed){
				remove_edge(graph, arg1, arg2);
				remove_edge(graph, arg2, arg1);
				sprintf(outBuffer, "+OK\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
			else{
				sprintf(outBuffer, "-ERR\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
		}
		else if(0 == strcasecmp(inBuffer, "ROUTE-SHOW"))
		{
			int no;
			Vertex *vert = find_vertex(graph,arg1);
			if(vert){
				Edge **eds  = get_edges(graph,vert,&no);
				sprintf(outBuffer, "+OK %d\r\n", no);
				write(sd, outBuffer, strlen(outBuffer));

				for(i=0;i<no;i++){
					int net = edge_destination(eds[i]);
					sprintf(outBuffer, "%d\r\n", net);
					write(sd, outBuffer, strlen(outBuffer));
				}
				free(eds);
			}
			else{
				sprintf(outBuffer, "-ERR\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}
		}
		else if(0 == strcasecmp(inBuffer, "ROUTE-HOP"))
		{
			int n;
			Path *table;
			Vertex *vert1 = find_vertex(graph,arg1);
			Vertex *vert2 = find_vertex(graph,arg2);

			if(vert1 && vert2 && arg1 != arg2){
				table = dijkstra(graph, arg1, &n);
				Path *p = table + arg2;
				sprintf(outBuffer, "+OK %d\r\n", p->next_hop);
				write(sd, outBuffer, strlen(outBuffer));
				free(table);
			}
			else{
				sprintf(outBuffer, "-ERR\r\n");
				write(sd, outBuffer, strlen(outBuffer));
			}

		}
		else if(0 == strcasecmp(inBuffer, "ROUTE-TABLE"))
		{
			int n,k,l;
			int i = 0;
			int *vertices, nVertices;
			Path *table2;

			table2 = dijkstra(graph, arg1, &n);
			sprintf(outBuffer, "+OK %d\r\n",n-2);
			write(sd, outBuffer, strlen(outBuffer));
			vertices = get_vertices(graph, &nVertices);

			for(k=0;k<nVertices;k++){
					for(l=k+1;l<nVertices;l++){
						if(vertices[k]>vertices[l]){
							int tmp = vertices[k];
							vertices[k]=vertices[l];
							vertices[l]=tmp;
						}
					}
				}

			for(i = 0; i < nVertices; i++)
			{

				if(vertices[i]!=arg1){
					Path *p = table2 + vertices[i];

					sprintf(outBuffer,"%d -> %d, next-hop %d, weight ",arg1,vertices[i],p->next_hop);
					write(sd, outBuffer, strlen(outBuffer));
					if(p->weight == DBL_MAX)
					{
						sprintf(outBuffer,"%s\r\n", "INF");
						write(sd, outBuffer, strlen(outBuffer));
					}
					else
					{
						sprintf(outBuffer,"%d\r\n",(int)p->weight);
						write(sd, outBuffer, strlen(outBuffer));
					}
				}
			}
			free(vertices);
			free(table2);

		}
		else{
			sprintf(outBuffer, "-ERR\r\n");
			write(sd, outBuffer, strlen(outBuffer));
		}


	}




}

void ReadLineFromNetwork(int sd, char *buf, int size)
{
	char l[kBufSize];
	int n;
	int i, j = 0;
	int cline = 0;

	do
	{
		n = read(sd, l, kBufSize);
		for(i = 0; i < n; i++){
			buf[j] = l[i];
			if(buf[j] == 10 && buf[j-1] == 13)
			{
				buf[j-1] = '\0';
				cline = 1;
				break;
			}
			j++;
		}
	} while(cline == 0 && n > 0);
}


