CC=gcc
CFLAGS=-Wall -ansi -pedantic-errors -g
CLIBS=

TASK1_TEST=1:3:1 1:5:2 2:3:10 2:4:2 3:4:2

all: task1_test

# libraries

linked_list.o: linked_list.c linked_list.h
	$(CC) -c $< $(CFLAGS)

graph.o: graph.c graph.h
	$(CC) -c $< $(CFLAGS)

# task 1

task1_test: task1_test.c linked_list.o graph.o
	$(CC) -o task1_test $^ $(CFLAGS) $(CLIBS)

task1_test_run: task1_test
	./task1_test $(TASK1_TEST)

task1_test_memcheck: task1_test
	valgrind --tool=memcheck --leak-check=yes --show-reachable=yes ./task1_test $(TASK1_TEST)

clean:
	rm -f task1_test *.o
