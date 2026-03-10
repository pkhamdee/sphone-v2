namespace SPhone.Domain.Common;

public class DomainException(string message) : Exception(message);

public class NotFoundException(string entity, object id)
    : Exception($"{entity} with id '{id}' was not found.");
