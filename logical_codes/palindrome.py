num=int(input("enter a number"))
original=num
rev = 0
while num > 0:
    digit= num%10
    print(digit)
    rev= rev*10 + digit
    print(rev) 
    num = num//10
    print(num)
if original ==rev:
    print(f"{original} is a palindrome  ")
else:
    print(f"{original} is not a palindrome ")