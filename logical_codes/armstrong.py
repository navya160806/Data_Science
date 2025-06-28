num = int(input("Enter a number: "))
original = num
sum = 0

while num > 0:
    digit = num%10
    print(digit)
    sum = sum + (digit ** 3)
    print(sum)
    num = num //10
    print(num)

if original == sum:
    print(f"{original} is an Armstrong number")
else:
    print(f"{original} is not an Armstrong number")

