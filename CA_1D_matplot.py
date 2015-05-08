import numpy as np
import matplotlib.pyplot as plt
import itertools

##############################################################################
#Initial Condition Variables:
##############################################################################
cell_number =100 # number of cells - ~150 - 200 should be max (~300 is when fine detail starts to emerge)
cellY = 1.0-float((1.0/(2.0*cell_number))) # vertical placement of first cell row
positionC ={}
generations = 220  # # or "Fit"
rule_input = 110
cell_states_input = 2 # example: 2 states = 0,1
rule_type_input = "Wolfram" #"Custom" or "Wolfram"
neighbors_input = 7
dimensions = 2

##############################################################################
#Initial System Calculations:
##############################################################################

#Generate a list of possible cell states from states variable
def cell_states():
    return range(0,cell_states_input)

#Generate number of neighbors for cell
def neighbors():
    if rule_type_input.lower() == "wolfram":
        #return len(str(rule_input))-1
        return 2
    else:
        return neighbors_input

#Generate a list of possible rule states from rule variable
def binseq(cell_states_list, neighbors_calc):

    #convert cell_states to a string
    state = ''.join(map(str, cell_states_list))

    # generate cartesian product for {0,1} and repeat it for k places
    li = (''.join(x) for x in itertools.product(state, repeat=neighbors_calc+1))
    # map all the values in the dic list to ints
    li = map(int, li)

    #format the list of ints so that it correctly reflects the cell and all of the neighbors
    index = 0
    for x in li:
        li[index] = format(x, ("0" + str(neighbors_calc+1)+"d"))
        index += 1

    #return the list of ints
    #li = map(int, li)  ##### shouldn't have to map twice FIX!
    return li

##############################################################################
#Initalize System and Print Conditions
##############################################################################

def print_initial_conditions():
    #Number of Generations
    print "******************Input Conditions******************"
    print "Number of Generations: " + str(generations)
    print "Number of Cells / Generation: " + str(cell_number)
    print "Cell States: " + str(cell_states_input)
    print "Neighbors: " + str(neighbors_input)
    print "Rule Type Input: " + str(rule_type_input)
    print "Rule Input: " + str(rule_input)

cell_states_list = cell_states()
neighbors_calc = neighbors()
statesList = binseq(cell_states_list, neighbors_calc)

def print_calculated_conditions():
    print "******************Initial System Data******************"
    print "Cell States: " + str(cell_states_list)
    print "Neighbors: " + str(neighbors_calc)
    print "Possible States:" + str(statesList)
    print "Actual State Count: " + str(len(statesList))
    print "Expected State Count:" + str((cell_states_input)**(neighbors_calc+1))

print print_initial_conditions()
print print_calculated_conditions()

##############################################################################
#Calculate CA Rule and Print CA Rule
##############################################################################

#Generate Rule Details from Binary Representation
def rule_bin():
    if rule_type_input.lower() == "wolfram":
        rule = str(np.binary_repr(rule_input))
    if len(rule)<len(statesList):
        for x in range(len(statesList)-len(rule)):
            rule = "0" + rule

    #flip number around (which is what wolfram does)

    rule = rule[::-1]

    return rule

#Map Binary Representation of CA Rules to Possible States
def rule_dic():
    rule = rule_bin()
    rules = {}
    j=0
    for i in statesList:
        rules[i] = int(rule[j])
        j+=1
    return rules

#Create CA Rules
rule_dictionary=rule_dic()

#Print CA Rules
def print_CA_rule():
    print "Binary Representation of Rule: " + str(rule_bin())
    print "Rule Dictionary (Rule: Corresponding State): " + str(rule_dictionary)

print_CA_rule()

##############################################################################
#Calculate First Generation of Cells
##############################################################################
#Randomly Generate First Generation of Cells
def first_gen():
    cell_dic = {}
    for i in range(cell_number):
        cell_dic[i] = np.random.random_integers(0, 1)
    return cell_dic

cell_state_dictionary = first_gen()

print "******************First Generation Data******************"
print "First Generation Cell State Dictionary (Cell#:State): " + str(cell_state_dictionary)
#print "n Generation Cell State Dictionary (Cell #: State): " + str(cell_state_dictionary)

##############################################################################
#Calculate Cell Rule Dictionary
##############################################################################
#Calculate Cell Neighbors - ONLY WORKS FOR TWO NEIGHBORS
def neighbours(cellN,dic):
    left_cell = cellN-1
    right_cell= cellN+1
    middle_cell = cellN

    #conditions for if a cell is beyond the end of the dictionary
    if cellN == 0:
        left_cell = len(dic)-1
    elif cellN >= len(dic)-1:
        right_cell = 0

    cell_pos_list = (left_cell, middle_cell, right_cell)
    neighbor_list = []

    for i in range(len(cell_pos_list)):
        neighbor_list.append(dic[cell_pos_list[i]])

    neighbor_list = map(str,neighbor_list)
    neighbor_list = "".join(neighbor_list)

    return neighbor_list


def cell_rule_dic():
    cell_rule = {}
    for x in range(cell_number):
        cell_rule[x] = neighbours(x,cell_state_dictionary)
    return cell_rule

cell_rule_dictionary = cell_rule_dic()
print "Cell Rule Dictionary(Cell#:Rule): " + str(cell_rule_dictionary)
################
#Draw Cells
##################

def draw_generation():
    fig = plt.gcf()
    ax = fig.add_subplot(1,1,1)
    n = cell_number
    for i in range(len(cell_state_dictionary.keys())):
        if cell_state_dictionary[i] == 0:
            state_color = 'w'
        elif cell_state_dictionary[i] == 1:
            state_color = 'b'
        x = float(1.0/n*i+(1.0/(2.0*n)))
        y = float(cellY)


        circle=plt.Circle([x, y], radius=float((1.0/(2.0*n))), color=state_color, linewidth=0, ls='solid')
        #1.0/float(3*n
        ax.add_artist(circle)
    #return plt.show()
draw_generation()

##############################################################################
#Apply CA Rule Dictionary to Cell Rule Dictionary
##############################################################################

def apply_rule():
    new_cell_dictionary = {}
    for x in cell_rule_dictionary:
        for y in rule_dictionary:
            if cell_rule_dictionary[x] == y:
                new_cell_dictionary[x] = rule_dictionary[y]
    return new_cell_dictionary


print "******************Run Program******************"
gen_counter = 0
if generations > cell_number:
    generations = cell_number
while gen_counter < generations:
    if gen_counter > 0:
        cell_state_dictionary = apply_rule()
        cell_rule_dictionary = cell_rule_dic()
    draw_generation()
    gen_counter += 1
    cellY -= float((1.0/(1.0*cell_number)))
plt.show()
