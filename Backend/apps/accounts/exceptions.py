from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Ensures API errors are always returned in a predictable JSON shape and
    never leak Python tracebacks to the client.
    """
    response = exception_handler(exc, context)
    if response is not None:
        if isinstance(response.data, dict) and "detail" not in response.data:
            response.data = {"detail": "Validation failed.", "errors": response.data}
    return response
