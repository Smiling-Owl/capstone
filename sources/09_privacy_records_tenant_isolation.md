# Privacy, records custody, and organization isolation

## Sources

Republic Act No. 10173. (2012). *Data Privacy Act of 2012*.

https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html

National Privacy Commission. (2016). *Implementing rules and regulations of Republic Act No. 10173*.

https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/

Republic Act No. 9470. (2007). *National Archives of the Philippines Act of 2007*.

https://lawphil.net/statutes/repacts/ra2007/ra_9470_2007.html

OWASP Foundation. (n.d.). *Multi-tenant security cheat sheet*.

https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html

## Evidence used

The Data Privacy Act permits outsourced processing but retains controller accountability and requires safeguards and documented processing terms. The National Archives Act keeps government records under the responsible public office's custody and requires approved retention and disposal procedures. OWASP recommends deriving tenant context from authenticated identity, validating ownership at the data-access layer, and testing for cross-tenant leakage.

## Limitation

Controller and processor roles depend on the actual processing arrangement. OWASP is technical guidance rather than Philippine law. Hosting government records does not make the startup their statutory owner or permit automatic deletion after customer offboarding.
