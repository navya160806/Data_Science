num = int(input("enter a number"))
if num <= 1:
    print(f"{num} is not a prime number")
else:
    for i in range(2,num):
        print(i)
        if num % i==0:
            print(f"{num}is not a prime number")
            break
    else:
        print(f"{num} is a prime number")