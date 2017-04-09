# The purpose of this file is to checking ISBN and return results to user browser when they keyin ISBN
from django.http import JsonResponse

def ajax_book_detail(request):
    a = {"c": 0, "b": 100}
    return JsonResponse(a, safe=False)

def ajax_receive(request):
    #is_ajax = True if request.is_ajax() else False
    return JsonResponse(request.POST, safe=False)

    

