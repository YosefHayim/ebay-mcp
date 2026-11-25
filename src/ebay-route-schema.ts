import { boolean, number, object, string, unknown, type ZodType } from 'zod';

import type { EbayRoute, RouteField } from './ebay-route.js';

function numberField(field: RouteField): ZodType {
  const isInteger = field.kind == 'integer';
  const base = isInteger ? number().int() : number();
  const withMinimum = field.minimum == null ? base : base.min(field.minimum);
  const withMaximum = field.maximum == null ? withMinimum : withMinimum.max(field.maximum);
  return withMaximum;
}

function baseField(field: RouteField): ZodType {
  const isNumber = field.kind == 'number';

  if (isNumber) {
    return numberField(field);
  }

  const isInteger = field.kind == 'integer';

  if (isInteger) {
    return numberField(field);
  }

  const isBoolean = field.kind == 'boolean';

  if (isBoolean) {
    return boolean();
  }

  return string();
}

function fieldSchema(field: RouteField): ZodType {
  const base = baseField(field);
  const isBlank = field.description == '';
  const described = isBlank ? base : base.describe(field.description);
  const isRequired = field.required;

  if (isRequired) {
    return described;
  }

  return described.optional();
}

function documentField(route: EbayRoute): ZodType {
  const isJson = route.contentType == 'application/json';
  const base = isJson ? unknown() : string();
  const described = base.describe('Document sent with this call.');
  const isRequired = route.documentRequired;

  if (isRequired) {
    return described;
  }

  return described.optional();
}

function routeSchema(route: EbayRoute) {
  const shape: Record<string, ZodType> = {};

  function addField(field: RouteField): void {
    shape[field.name] = fieldSchema(field);
  }

  for (const field of route.fields) {
    addField(field);
  }

  const { sendsDocument } = route;

  if (sendsDocument) {
    shape['document'] = documentField(route);
  }

  return object(shape);
}

export { routeSchema };
